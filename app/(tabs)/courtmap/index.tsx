import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Plus, Star, Users, Clock } from 'lucide-react-native';

// Only import MapView on native platforms
const MapView = Platform.select({
  native: () => require('react-native-maps').default,
  default: () => null,
})();

const Marker = Platform.select({
  native: () => require('react-native-maps').Marker,
  default: () => null,
})();

// Mock data for basketball courts
const COURTS = [
  {
    id: '1',
    name: 'National Stadium Courts',
    address: 'Surulere, Lagos',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    rating: 4.5,
    totalRatings: 28,
    isBusy: true,
    freeAccess: true,
    latitude: 6.4968,
    longitude: 3.3702,
  },
  {
    id: '2',
    name: 'Teslim Balogun Stadium',
    address: 'Lagos Island',
    image: 'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg',
    rating: 4.2,
    totalRatings: 15,
    isBusy: false,
    freeAccess: false,
    latitude: 6.5125,
    longitude: 3.3662,
  },
  {
    id: '3',
    name: 'University of Lagos Courts',
    address: 'Akoka, Yaba',
    image: 'https://images.pexels.com/photos/1145793/pexels-photo-1145793.jpeg',
    rating: 4.7,
    totalRatings: 42,
    isBusy: true,
    freeAccess: true,
    latitude: 6.5168,
    longitude: 3.3898,
  },
  {
    id: '4',
    name: 'Dodan Barracks Court',
    address: 'Ikoyi, Lagos',
    image: 'https://images.pexels.com/photos/2351289/pexels-photo-2351289.jpeg',
    rating: 3.9,
    totalRatings: 12,
    isBusy: false,
    freeAccess: true,
    latitude: 6.4512,
    longitude: 3.4179,
  },
  {
    id: '5',
    name: 'Dolphins Indoor Basketball Court',
    address: 'Punch Estate, Olu Aboderin Street, Mangoro, Ikeja, Lagos',
    image: 'https://images.pexels.com/photos/1716764/pexels-photo-1716764.jpeg',
    rating: 4.5,
    totalRatings: 4,
    isBusy: true,
    freeAccess: false,
    latitude: 6.6055,
    longitude: 3.3372,
  },
  {
    id: '6',
    name: 'Dodan Warriors Basketball Court',
    address: '28/32 Ilupeju Industrial Ave, Ilupeju, Lagos',
    image: 'https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg',
    rating: 4.3,
    totalRatings: 8,
    isBusy: true,
    freeAccess: true,
    latitude: 6.5532,
    longitude: 3.3614,
  },
  {
    id: '7',
    name: 'LUTH Basketball Court',
    address: 'Idi Oro, Lagos',
    image: 'https://images.pexels.com/photos/1305341/pexels-photo-1305341.jpeg',
    rating: 3.7,
    totalRatings: 7,
    isBusy: false,
    freeAccess: true,
    latitude: 6.5112,
    longitude: 3.3573,
  },
  {
    id: '8',
    name: 'Laspark Basketball Court',
    address: 'Ikorodu Recreational Centre, Dangote Ebutte Ipakodo, Ikorodu, Lagos',
    image: 'https://images.pexels.com/photos/2329598/pexels-photo-2329598.jpeg',
    rating: 4.2,
    totalRatings: 5,
    isBusy: false,
    freeAccess: true,
    latitude: 6.6162,
    longitude: 3.5045,
  },
  {
    id: '9',
    name: 'IBA Wolves Basketball Court',
    address: 'Iba Housing Estate, Zone A, Carpark 2, Ojo, Lagos',
    image: 'https://images.pexels.com/photos/3631430/pexels-photo-3631430.jpeg',
    rating: 4.0,
    totalRatings: 1,
    isBusy: true,
    freeAccess: true,
    latitude: 6.4781,
    longitude: 3.1982,
  },
  {
    id: '10',
    name: 'Ndubuisi Kanu Park Basketball Court',
    address: 'Mobolaji Johnson Ave, Oregun, Ikeja, Lagos',
    image: 'https://images.pexels.com/photos/2351283/pexels-photo-2351283.jpeg',
    rating: 3.0,
    totalRatings: 2,
    isBusy: false,
    freeAccess: true,
    latitude: 6.5982,
    longitude: 3.3676,
  },
  {
    id: '11',
    name: 'Campos Basketball Court',
    address: 'Lagos Island',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    rating: 4.0,
    totalRatings: 0,
    isBusy: true,
    freeAccess: true,
    latitude: 6.4542,
    longitude: 3.3947,
  },
  {
    id: '12',
    name: 'Abesan Mini Stadium',
    address: 'Jakande Low-Cost Housing Estate, Iyana Ipaja, Lagos',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    rating: 3.8,
    totalRatings: 0,
    isBusy: false,
    freeAccess: true,
    latitude: 6.6165,
    longitude: 3.2682,
  },
  {
    id: '13',
    name: 'Rowe Park Sports Complex',
    address: 'Mobolaji Johnson Ave, Lagos',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    rating: 4.3,
    totalRatings: 0,
    isBusy: true,
    freeAccess: false,
    latitude: 6.5917,
    longitude: 3.3504,
  },
  {
    id: '14',
    name: 'YMCA Basketball Court',
    address: 'Lagos',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    rating: 3.5,
    totalRatings: 0,
    isBusy: false,
    freeAccess: true,
    latitude: 6.4556,
    longitude: 3.3947,
  },
  {
    id: '15',
    name: 'NSL Court',
    address: 'Lagos',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    rating: 3.5,
    totalRatings: 0,
    isBusy: false,
    freeAccess: true,
    latitude: 6.4931,
    longitude: 3.3842,
  },
  {
    id: '16',
    name: 'Ejigbo Mini Stadium',
    address: 'Ejigbo, Lagos',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    rating: 4.0,
    totalRatings: 0,
    isBusy: false,
    freeAccess: true,
    latitude: 6.5655,
    longitude: 3.3076,
  },
  {
    id: '17',
    name: 'Gaskiya College',
    address: 'Lagos',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    rating: 3.5,
    totalRatings: 0,
    isBusy: false,
    freeAccess: true,
    latitude: 6.5021,
    longitude: 3.3567,
  },
  {
    id: '18',
    name: 'Egan Grammar School',
    address: 'Lagos',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    rating: 3.5,
    totalRatings: 0,
    isBusy: false,
    freeAccess: true,
    latitude: 6.5634,
    longitude: 3.2341,
  },
  {
    id: '19',
    name: 'DREAM BIG Basketball Court',
    address: 'Ijeshatedo Grammar School, Off Ibeh Street, Isolo, Lagos',
    image: 'https://images.pexels.com/photos/945471/pexels-photo-945471.jpeg',
    rating: 4.4,
    totalRatings: 12,
    isBusy: true,
    freeAccess: true,
    latitude: 6.5289,
    longitude: 3.3297,
  },
];

export default function CourtMapScreen() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [region, setRegion] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleCourtSelect = (court) => {
    setSelectedCourt(court);
    
    // Center map on selected court
    if (Platform.OS !== 'web' && mapRef.current) {
      mapRef.current?.animateToRegion({
        latitude: court.latitude,
        longitude: court.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const renderCourtItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.courtCard} 
      onPress={() => handleCourtSelect(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.courtImage} />
      
      <View style={styles.courtCardContent}>
        <Text style={styles.courtName}>{item.name}</Text>
        <Text style={styles.courtAddress}>{item.address}</Text>
        
        <View style={styles.courtMetadata}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.totalRatings}>({item.totalRatings})</Text>
          </View>
          
          <View style={[
            styles.statusBadge, 
            item.isBusy ? styles.busyBadge : styles.freeBadge
          ]}>
            <Clock size={12} color={item.isBusy ? "#B91C1C" : "#15803D"} />
            <Text style={[
              styles.statusText,
              item.isBusy ? styles.busyText : styles.freeText
            ]}>
              {item.isBusy ? 'Busy' : 'Free'}
            </Text>
          </View>
          
          {item.freeAccess && (
            <View style={styles.freeAccessBadge}>
              <Text style={styles.freeAccessText}>Free Access</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webMapPlaceholder}>
          <MapPin size={32} color="#F97316" />
          <Text style={styles.webMapText}>Map View</Text>
          <Text style={styles.webMapSubtext}>
            Interactive map available on mobile devices
          </Text>
        </View>
      );
    }

    if (!MapView || !Marker) return null;

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        initialRegion={region}
        showsUserLocation={true}
      >
        {COURTS.map((court) => (
          <Marker
            key={court.id}
            coordinate={{
              latitude: court.latitude,
              longitude: court.longitude,
            }}
            title={court.name}
            description={court.address}
            onPress={() => handleCourtSelect(court)}
          />
        ))}
      </MapView>
    );
  };

  return (
    <View style={styles.container}>
      {renderMap()}
      
      <View style={styles.courtsListContainer}>
        <View style={styles.courtsHeader}>
          <Text style={styles.nearbyTitle}>Courts Near You</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/courtmap/add-court')}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Court</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={COURTS}
          renderItem={renderCourtItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.courtsList}
          snapToInterval={280}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / 280);
            if (COURTS[index]) {
              handleCourtSelect(COURTS[index]);
            }
          }}
        />
      </View>
      
      {selectedCourt && (
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => router.push({
            pathname: '/courtmap/court-details',
            params: { id: selectedCourt.id }
          })}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  webMapText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#334155',
    marginTop: 12,
  },
  webMapSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
  courtsListContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
  courtsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  nearbyTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#1E293B',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  courtsList: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  courtCard: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courtImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  courtCardContent: {
    padding: 12,
  },
  courtName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 2,
  },
  courtAddress: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  courtMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  ratingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#475569',
    marginLeft: 4,
  },
  totalRatings: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  busyBadge: {
    backgroundColor: '#FEE2E2',
  },
  freeBadge: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    marginLeft: 3,
  },
  busyText: {
    color: '#B91C1C',
  },
  freeText: {
    color: '#15803D',
  },
  freeAccessBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  freeAccessText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#2563EB',
  },
  viewDetailsButton: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewDetailsText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});