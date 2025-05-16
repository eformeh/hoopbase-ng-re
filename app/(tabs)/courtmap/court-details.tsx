import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MapPin, Clock, Star, Users, Calendar, MessageCircle, Share2 } from 'lucide-react-native';

// Define the type for a court
type Court = {
  id: string;
  name: string;
  address: string;
  images: string[];
  description: string;
  rating: number;
  totalRatings: number;
  isBusy: boolean;
  busyTimes: string[];
  freeAccess: boolean;
  entranceFee?: string;
  hasLighting: boolean;
  surface: string;
  basketHeight: string;
  comments: Array<{
    id: string;
    user: string;
    text: string;
    date: string;
    rating: number;
  }>;
};

// Mock data for basketball courts
const COURTS: { [key: string]: Court } = {
  '1': {
    id: '1',
    name: 'National Stadium Courts',
    address: 'Surulere, Lagos',
    images: [
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
      'https://images.pexels.com/photos/3228766/pexels-photo-3228766.jpeg',
      'https://images.pexels.com/photos/945471/pexels-photo-945471.jpeg',
    ],
    description: 'Official basketball courts located within the National Stadium complex. Features 2 full courts with fiberglass backboards and well-maintained surfaces.',
    rating: 4.5,
    totalRatings: 28,
    isBusy: true,
    busyTimes: ['Weekends 4-7PM', 'Weekdays 5-8PM'],
    freeAccess: true,
    hasLighting: true,
    surface: 'Concrete',
    basketHeight: 'Standard (10ft)',
    comments: [
      {
        id: 'c1',
        user: 'OluwaDavid',
        text: 'Great court, but gets very busy on weekends. Go early if you want to play.',
        date: '3 days ago',
        rating: 4,
      },
      {
        id: 'c2',
        user: 'BasketballFan',
        text: 'The surface is in good condition. Nice place to play pickup games.',
        date: '1 week ago',
        rating: 5,
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Teslim Balogun Stadium',
    address: 'Lagos Island',
    images: [
      'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg',
      'https://images.pexels.com/photos/1331750/pexels-photo-1331750.jpeg',
    ],
    description: 'Indoor basketball court with professional flooring and equipment. Part of the Teslim Balogun Stadium complex.',
    rating: 4.2,
    totalRatings: 15,
    isBusy: false,
    busyTimes: ['Weekdays 6-9PM'],
    freeAccess: false,
    entranceFee: '₦1,000 per person',
    hasLighting: true,
    surface: 'Hardwood',
    basketHeight: 'Standard (10ft)',
    comments: [
      {
        id: 'c1',
        user: 'CourtExplorer',
        text: 'Worth the entrance fee. Best indoor court in Lagos.',
        date: '2 weeks ago',
        rating: 5,
      },
    ],
  },
  '3': {
    id: '3',
    name: 'Dolphins Indoor Basketball Court',
    address: 'Punch Estate, Olu Aboderin Street, Mangoro, Ikeja, Lagos',
    images: [
      'https://images.pexels.com/photos/1716764/pexels-photo-1716764.jpeg',
      'https://images.pexels.com/photos/1040473/pexels-photo-1040473.jpeg',
    ],
    description: 'Well-maintained indoor basketball facility with additional amenities including a swimming pool and gym. The court is secured and suitable for events.',
    rating: 4.5,
    totalRatings: 4,
    isBusy: true,
    busyTimes: ['Saturdays 12PM-4PM', 'Weekdays 5-8PM'],
    freeAccess: false,
    hasLighting: true,
    surface: 'Hardwood',
    basketHeight: 'Standard (10ft)',
    comments: [
      {
        id: 'c1',
        user: 'LagosHooper',
        text: 'Nice place to ball. Just needs a few minor improvements.',
        date: '1 month ago',
        rating: 4,
      },
    ],
  },
  '4': {
    id: '4',
    name: 'Dodan Warriors Basketball Court',
    address: '28/32 Ilupeju Industrial Ave, Ilupeju, Lagos',
    images: [
      'https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg',
    ],
    description: 'Home court of the Dodan Warriors basketball team. Good place to hang out with friends and play pickup games.',
    rating: 4.3,
    totalRatings: 8,
    isBusy: true,
    busyTimes: ['Weekends 3-7PM'],
    freeAccess: true,
    hasLighting: true,
    surface: 'Concrete',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '5': {
    id: '5',
    name: 'LUTH Basketball Court',
    address: 'Idi Oro, Lagos',
    images: [
      'https://images.pexels.com/photos/1305341/pexels-photo-1305341.jpeg',
    ],
    description: 'Multi-purpose court located at the Lagos University Teaching Hospital. Facilities for basketball, volleyball, handball, and football with seating areas.',
    rating: 3.7,
    totalRatings: 7,
    isBusy: false,
    busyTimes: ['Weekdays 4-7PM'],
    freeAccess: true,
    hasLighting: false,
    surface: 'Concrete',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '6': {
    id: '6',
    name: 'Laspark Basketball Court',
    address: 'Ikorodu Recreational Centre, Dangote Ebutte Ipakodo, Ikorodu, Lagos',
    images: [
      'https://images.pexels.com/photos/2329598/pexels-photo-2329598.jpeg',
    ],
    description: 'Basketball court located within the Ikorodu Recreational Centre (LASPARK).',
    rating: 4.2,
    totalRatings: 5,
    isBusy: false,
    busyTimes: ['Weekends 4-7PM'],
    freeAccess: true,
    hasLighting: false,
    surface: 'Concrete',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '7': {
    id: '7',
    name: 'IBA Wolves Basketball Court',
    address: 'Iba Housing Estate, Zone A, Carpark 2, Ojo, Lagos',
    images: [
      'https://images.pexels.com/photos/3631430/pexels-photo-3631430.jpeg',
    ],
    description: 'Community basketball court known for Sunday games that unite players from different communities.',
    rating: 4.0,
    totalRatings: 1,
    isBusy: true,
    busyTimes: ['Sundays 2-6PM'],
    freeAccess: true,
    hasLighting: false,
    surface: 'Concrete',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '8': {
    id: '8',
    name: 'Ndubuisi Kanu Park Basketball Court',
    address: 'Mobolaji Johnson Ave, Oregun, Ikeja, Lagos',
    images: [
      'https://images.pexels.com/photos/2351283/pexels-photo-2351283.jpeg',
    ],
    description: 'Basketball court located within Ndubuisi Kanu Park. Good for relaxation, picnics, reunions, and celebrations. Also used by Flygerian Basketball for events.',
    rating: 3.0,
    totalRatings: 2,
    isBusy: false,
    busyTimes: [],
    freeAccess: true,
    hasLighting: false,
    surface: 'Concrete',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '9': {
    id: '9',
    name: 'Campos Basketball Court',
    address: 'Lagos Island',
    images: [
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    ],
    description: 'Part of Campos Memorial Mini Stadium which includes a basketball court and a 9-aside football pitch, designed as a community sports facility.',
    rating: 4.0,
    totalRatings: 0,
    isBusy: true,
    busyTimes: ['Weekends 3-7PM'],
    freeAccess: true,
    hasLighting: true,
    surface: 'Concrete',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '10': {
    id: '10',
    name: 'Abesan Mini Stadium',
    address: 'Jakande Low-Cost Housing Estate, Iyana Ipaja, Lagos',
    images: [
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    ],
    description: 'Facilities include a basketball court, volleyball court, and an open playing field for football. The court has a bright design that complements the city\'s energy.',
    rating: 3.8,
    totalRatings: 0,
    isBusy: false,
    busyTimes: [],
    freeAccess: true,
    hasLighting: false,
    surface: 'Concrete',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '11': {
    id: '11',
    name: 'Rowe Park Sports Complex',
    address: 'Mobolaji Johnson Ave, Lagos',
    images: [
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    ],
    description: 'Comprehensive sports facility named after the first Military Governor of Lagos State. Features multiple courts including basketball, volleyball, handball, tennis, an Olympic-sized swimming pool, and sports medicine facilities.',
    rating: 4.3,
    totalRatings: 0,
    isBusy: true,
    busyTimes: ['Weekdays 4-8PM', 'Weekends 2-7PM'],
    freeAccess: false,
    entranceFee: '₦500 per person',
    hasLighting: true,
    surface: 'Various',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '12': {
    id: '12',
    name: 'YMCA Basketball Court',
    address: 'Lagos',
    images: [
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    ],
    description: 'Basketball court located at the YMCA Lagos branch.',
    rating: 3.5,
    totalRatings: 0,
    isBusy: false,
    busyTimes: [],
    freeAccess: true,
    hasLighting: false,
    surface: 'Concrete',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '13': {
    id: '13',
    name: 'NSL Court',
    address: 'Lagos',
    images: [
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    ],
    description: 'Basketball court listed on Courts of the World website.',
    rating: 3.5,
    totalRatings: 0,
    isBusy: false,
    busyTimes: [],
    freeAccess: true,
    hasLighting: false,
    surface: 'Concrete',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '14': {
    id: '14',
    name: 'Ejigbo Mini Stadium',
    address: 'Ejigbo, Lagos',
    images: [
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    ],
    description: 'Basketball court built through the Giants of Africa initiative in partnership with the 2K Foundation.',
    rating: 4.0,
    totalRatings: 0,
    isBusy: false,
    busyTimes: [],
    freeAccess: true,
    hasLighting: false,
    surface: 'Sport Court',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '15': {
    id: '15',
    name: 'Gaskiya College',
    address: 'Lagos',
    images: [
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    ],
    description: 'Basketball court built through the Giants of Africa \'Built Within\' initiative sponsored by the Jess and Scott Lake Foundation.',
    rating: 3.5,
    totalRatings: 0,
    isBusy: false,
    busyTimes: [],
    freeAccess: true,
    hasLighting: false,
    surface: 'Sport Court',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '16': {
    id: '16',
    name: 'Egan Grammar School',
    address: 'Lagos',
    images: [
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    ],
    description: 'Basketball court built through the Giants of Africa \'Built Within\' initiative sponsored by the Jess and Scott Lake Foundation.',
    rating: 3.5,
    totalRatings: 0,
    isBusy: false,
    busyTimes: [],
    freeAccess: true,
    hasLighting: false,
    surface: 'Sport Court',
    basketHeight: 'Standard (10ft)',
    comments: [],
  },
  '17': {
    id: '17',
    name: 'DREAM BIG Basketball Court',
    address: 'Ijeshatedo Grammar School, Off Ibeh Street, Isolo, Lagos',
    images: [
      'https://images.pexels.com/photos/945471/pexels-photo-945471.jpeg',
    ],
    description: 'The first court unveiled in Nigeria by Giants of Africa as part of their 100-court initiative. Features an inspirational "Dream Big" theme to motivate young players. Host to basketball clinics and youth development programs.',
    rating: 4.4,
    totalRatings: 12,
    isBusy: true,
    busyTimes: ['Weekdays 3-6PM', 'Weekends 10AM-2PM'],
    freeAccess: true,
    hasLighting: true,
    surface: 'Sport Court',
    basketHeight: 'Standard (10ft)',
    comments: [
      {
        id: 'c1',
        user: 'BasketballCoach',
        text: 'Excellent facility for young players. The court surface is well-maintained and the inspirational messaging really motivates the kids.',
        date: '2 months ago',
        rating: 5,
      },
      {
        id: 'c2',
        user: 'LocalPlayer',
        text: 'Good place to play, but gets very busy after school hours. Come early if you want court time.',
        date: '3 weeks ago',
        rating: 4,
      }
    ],
  },
};

export default function CourtDetailsScreen() {
  const { id } = useLocalSearchParams();
  const court = COURTS[id as string];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);

  if (!court) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Court not found</Text>
      </View>
    );
  }

  const renderStars = (rating, size = 18, interactive = false) => {
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageCarousel}>
        <Image 
          source={{ uri: court.images[activeImageIndex] }} 
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
            <Text style={styles.ratingValue}>{court.rating}</Text>
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
          
          {!court.freeAccess && (
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
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews & Comments</Text>
            <Text style={styles.commentCount}>
              {court.comments.length} {court.comments.length === 1 ? 'Comment' : 'Comments'}
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
            
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Post Review</Text>
            </TouchableOpacity>
          </View>
          
          {/* Comments list */}
          {court.comments.map((comment) => (
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
          ))}
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Calendar size={20} color="#F97316" />
            <Text style={styles.actionButtonText}>Schedule Visit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
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
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});