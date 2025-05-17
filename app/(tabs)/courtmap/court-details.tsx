import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Clock, Star, Users, Calendar, MessageCircle, Share2 } from 'lucide-react-native';
import { fetchCourtById, type Court } from '@/lib/courts';
import { supabase } from '@/lib/supabase';

export default function CourtDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadCourtDetails();
  }, [id]);

  const loadCourtDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    const courtData = await fetchCourtById(id as string);
    setCourt(courtData);
    setLoading(false);
  };

  const submitComment = async () => {
    if (!commentText || userRating === 0 || !court) return;
    
    try {
      setSubmittingComment(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to post a review');
        setSubmittingComment(false);
        return;
      }
      
      // Insert the comment
      const { error } = await supabase
        .from('court_comments')
        .insert({
          court_id: court.id,
          user_id: user.id,
          comment: commentText,
          rating: userRating,
        });
        
      if (error) throw error;
      
      // Update the total ratings and average rating for the court
      await supabase.rpc('update_court_rating', { 
        court_id: court.id 
      });
      
      // Reset form
      setCommentText('');
      setUserRating(0);
      
      // Reload court data to show the new comment
      await loadCourtDetails();
      
      alert('Your review has been posted!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post review. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderStars = (rating: number, size = 18, interactive = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <TouchableOpacity 
            key={i} 
            onPress={() => setUserRating(i)}
            style={{ padding: 2 }}
          >
            <Star 
              size={size} 
              color="#F59E0B" 
              fill={i <= userRating ? "#F59E0B" : "transparent"} 
            />
          </TouchableOpacity>
        );
      } else {
        stars.push(
          <Star 
            key={i} 
            size={size} 
            color="#F59E0B" 
            fill={i <= fullStars || (i === fullStars + 1 && hasHalfStar) ? "#F59E0B" : "transparent"} 
          />
        );
      }
    }
    
    return stars;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading court details...</Text>
      </View>
    );
  }

  if (!court) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Court not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageCarousel}>
        <Image 
          source={{ uri: court.images[activeImageIndex] || court.image }} 
          style={styles.headerImage} 
        />
        
        <View style={styles.imageIndicators}>
          {court.images.map((_, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.indicator,
                index === activeImageIndex && styles.activeIndicator
              ]}
              onPress={() => setActiveImageIndex(index)}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.courtName}>{court.name}</Text>
            <View style={styles.addressContainer}>
              <MapPin size={16} color="#64748B" />
              <Text style={styles.courtAddress}>{court.address}</Text>
            </View>
          </View>
          
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingValue}>{court.rating.toFixed(1)}</Text>
            <View style={styles.starsContainer}>
              {renderStars(court.rating, 14)}
            </View>
            <Text style={styles.totalRatings}>({court.totalRatings})</Text>
          </View>
        </View>
        
        <View style={styles.statusSection}>
          <View style={styles.statusItem}>
            <View style={[
              styles.statusBadge, 
              court.isBusy ? styles.busyBadge : styles.freeBadge
            ]}>
              <Clock size={16} color={court.isBusy ? "#B91C1C" : "#15803D"} />
              <Text style={[
                styles.statusText,
                court.isBusy ? styles.busyText : styles.freeText
              ]}>
                {court.isBusy ? 'Currently Busy' : 'Currently Free'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <View style={[
              styles.statusBadge, 
              court.freeAccess ? styles.freeAccessBadge : styles.paidAccessBadge
            ]}>
              <Users size={16} color={court.freeAccess ? "#2563EB" : "#9333EA"} />
              <Text style={[
                styles.statusText,
                court.freeAccess ? styles.freeAccessText : styles.paidAccessText
              ]}>
                {court.freeAccess ? 'Free Access' : 'Paid Access'}
              </Text>
            </View>
          </View>
          
          {!court.freeAccess && court.entranceFee && (
            <Text style={styles.feeText}>
              Fee: {court.entranceFee}
            </Text>
          )}
        </View>
        
        <Text style={styles.description}>{court.description}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Court Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Surface</Text>
              <Text style={styles.infoValue}>{court.surface}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Basket Height</Text>
              <Text style={styles.infoValue}>{court.basketHeight}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Lighting</Text>
              <Text style={styles.infoValue}>
                {court.hasLighting ? 'Available' : 'Not available'}
              </Text>
            </View>
          </View>
        </View>
        
        {court.busyTimes && court.busyTimes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Busy Times</Text>
            <View style={styles.busyTimesContainer}>
              {court.busyTimes.map((time, index) => (
                <View key={index} style={styles.busyTimeItem}>
                  <Calendar size={16} color="#64748B" />
                  <Text style={styles.busyTimeText}>{time}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews & Comments</Text>
            <Text style={styles.commentCount}>
              {court.comments ? court.comments.length : 0} {court.comments && court.comments.length === 1 ? 'Comment' : 'Comments'}
            </Text>
          </View>
          
          {/* Add review section */}
          <View style={styles.addReviewContainer}>
            <Text style={styles.addReviewTitle}>Add Your Review</Text>
            
            <View style={styles.ratingInputContainer}>
              <Text style={styles.ratingInputLabel}>Your Rating:</Text>
              <View style={styles.starsInput}>
                {renderStars(0, 24, true)}
              </View>
            </View>
            
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience at this court..."
              multiline={true}
              numberOfLines={3}
              value={commentText}
              onChangeText={setCommentText}
            />
            
            <TouchableOpacity 
              style={[styles.submitButton, (submittingComment || !commentText || userRating === 0) && styles.submitButtonDisabled]}
              onPress={submitComment}
              disabled={submittingComment || !commentText || userRating === 0}
            >
              <Text style={styles.submitButtonText}>
                {submittingComment ? 'Posting...' : 'Post Review'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Comments list */}
          {court.comments && court.comments.length > 0 ? (
            court.comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentDate}>{comment.date}</Text>
                </View>
                
                <View style={styles.commentRating}>
                  {renderStars(comment.rating, 14)}
                </View>
                
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noCommentsText}>No reviews yet. Be the first to review!</Text>
          )}
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {/* Logic for scheduling visit */}}
          >
            <Calendar size={20} color="#F97316" />
            <Text style={styles.actionButtonText}>Schedule Visit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {/* Logic for sharing court */}}
          >
            <Share2 size={20} color="#F97316" />
            <Text style={styles.actionButtonText}>Share Court</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    backgroundColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  imageCarousel: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 16,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courtName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
courtAddress: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  ratingBadge: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  ratingValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#F59E0B',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  totalRatings: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  statusSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusItem: {
    marginRight: 12,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  busyBadge: {
    backgroundColor: '#FEE2E2',
  },
  freeBadge: {
    backgroundColor: '#DCFCE7',
  },
  freeAccessBadge: {
    backgroundColor: '#EFF6FF',
  },
  paidAccessBadge: {
    backgroundColor: '#F5F3FF',
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    marginLeft: 6,
  },
  busyText: {
    color: '#B91C1C',
  },
  freeText: {
    color: '#15803D',
  },
  freeAccessText: {
    color: '#2563EB',
  },
  paidAccessText: {
    color: '#9333EA',
  },
  feeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#9333EA',
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 12,
  },
  commentCount: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#334155',
  },
  busyTimesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  busyTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  busyTimeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
  },
  addReviewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addReviewTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#334155',
    marginBottom: 12,
  },
  ratingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingInputLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
    marginRight: 12,
  },
  starsInput: {
    flexDirection: 'row',
  },
  commentInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#334155',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#F97316',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#FDBA74',
  },
  submitButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  commentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUser: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#334155',
  },
  commentDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  commentRating: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  noCommentsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#F97316',
    marginLeft: 8,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});