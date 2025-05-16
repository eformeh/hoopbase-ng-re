import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Clipboard, Calendar, ChartLine as LineChart, Plus, ArrowDown, ArrowUp, FileText, CreditCard as Edit } from 'lucide-react-native';

// Mock data for pain logs
const PAIN_LOGS = [
  {
    id: '1',
    date: 'June 10, 2025',
    painLevel: 7,
    location: 'Right Knee',
    notes: 'Pain during jumping and landing. Applied ice after practice.',
    rehab: ['Ice', 'Stretching', 'Rest'],
  },
  {
    id: '2',
    date: 'June 9, 2025',
    painLevel: 8,
    location: 'Right Knee',
    notes: 'Worse pain today. Skipped practice.',
    rehab: ['Ice', 'Elevation', 'Rest'],
  },
  {
    id: '3',
    date: 'June 8, 2025',
    painLevel: 5,
    location: 'Right Knee',
    notes: 'Started feeling pain during practice. Could be from new shoes.',
    rehab: ['Ice', 'Stretching'],
  },
  {
    id: '4',
    date: 'June 5, 2025',
    painLevel: 2,
    location: 'Lower Back',
    notes: 'Mild discomfort after weight training.',
    rehab: ['Stretching'],
  },
];

// Mock data for weekly trend
const WEEKLY_TREND = [
  { day: 'M', value: 3 },
  { day: 'T', value: 5 },
  { day: 'W', value: 4 },
  { day: 'T', value: 6 },
  { day: 'F', value: 5 },
  { day: 'S', value: 8 },
  { day: 'S', value: 7 },
];

// Helper function to get pain level color
const getPainLevelColor = (level) => {
  if (level <= 3) return '#10B981'; // Green for mild
  if (level <= 6) return '#F59E0B'; // Yellow/Orange for moderate
  return '#EF4444'; // Red for severe
};

// Helper function to get pain level label
const getPainLevelLabel = (level) => {
  if (level <= 3) return 'Mild';
  if (level <= 6) return 'Moderate';
  return 'Severe';
};

export default function InjuryLogScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month'
  
  // Calculate current trend (up or down)
  const latestTwoEntries = PAIN_LOGS.slice(0, 2);
  const trend = latestTwoEntries.length === 2 
    ? latestTwoEntries[0].painLevel - latestTwoEntries[1].painLevel 
    : 0;
  
  const renderLogItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.logItem}
      onPress={() => router.push({
        pathname: '/injurylog/entry-details',
        params: { id: item.id }
      })}
    >
      <View style={styles.logItemHeader}>
        <Text style={styles.logDate}>{item.date}</Text>
        <View style={[
          styles.painLevelBadge,
          { backgroundColor: `${getPainLevelColor(item.painLevel)}20` }
        ]}>
          <Text style={[
            styles.painLevelText,
            { color: getPainLevelColor(item.painLevel) }
          ]}>
            {getPainLevelLabel(item.painLevel)} Pain ({item.painLevel}/10)
          </Text>
        </View>
      </View>
      
      <View style={styles.logItemBody}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Location:</Text>
          <Text style={styles.locationValue}>{item.location}</Text>
        </View>
        
        <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
        
        <View style={styles.rehabContainer}>
          {item.rehab.map((task, index) => (
            <View key={index} style={styles.rehabBadge}>
              <Text style={styles.rehabText}>{task}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>Current Pain Status</Text>
              <Text style={styles.summarySubtitle}>Based on your recent logs</Text>
            </View>
            <Clipboard size={24} color="#64748B" />
          </View>
          
          <View style={styles.painStatusContainer}>
            <View style={styles.currentPainLevel}>
              <Text style={styles.currentPainValue}>{PAIN_LOGS[0].painLevel}</Text>
              <Text style={styles.currentPainLabel}>/10</Text>
            </View>
            
            <View style={styles.painTrendContainer}>
              <View style={styles.painTrend}>
                {trend < 0 ? (
                  <>
                    <ArrowDown size={16} color="#10B981" />
                    <Text style={[styles.trendText, styles.trendImproved]}>
                      Improved by {Math.abs(trend)} points
                    </Text>
                  </>
                ) : trend > 0 ? (
                  <>
                    <ArrowUp size={16} color="#EF4444" />
                    <Text style={[styles.trendText, styles.trendWorsened]}>
                      Worsened by {trend} points
                    </Text>
                  </>
                ) : (
                  <Text style={styles.trendText}>No change</Text>
                )}
              </View>
              
              <Text style={styles.painLocationText}>
                Primary: {PAIN_LOGS[0].location}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Weekly Trend Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>7-Day Pain Trend</Text>
            <Calendar size={20} color="#64748B" />
          </View>
          
          <View style={styles.chartContainer}>
            {WEEKLY_TREND.map((item, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: `${(item.value * 10)}%`,
                        backgroundColor: getPainLevelColor(item.value)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.dayLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Pain Logs List */}
        <View style={styles.logsSection}>
          <View style={styles.logsSectionHeader}>
            <Text style={styles.sectionTitle}>Pain Log Entries</Text>
            <TouchableOpacity 
              style={styles.addEntryButton}
              onPress={() => router.push('/injurylog/add-entry')}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addEntryButtonText}>New Entry</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[
                styles.filterButton,
                filter === 'all' && styles.activeFilterButton
              ]}
              onPress={() => setFilter('all')}
            >
              <Text style={[
                styles.filterText,
                filter === 'all' && styles.activeFilterText
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton,
                filter === 'week' && styles.activeFilterButton
              ]}
              onPress={() => setFilter('week')}
            >
              <Text style={[
                styles.filterText,
                filter === 'week' && styles.activeFilterText
              ]}>
                Last Week
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton,
                filter === 'month' && styles.activeFilterButton
              ]}
              onPress={() => setFilter('month')}
            >
              <Text style={[
                styles.filterText,
                filter === 'month' && styles.activeFilterText
              ]}>
                Last Month
              </Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={PAIN_LOGS}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <FileText size={20} color="#F97316" />
            <Text style={styles.actionButtonText}>Export Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Edit size={20} color="#F97316" />
            <Text style={styles.actionButtonText}>Recovery Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  summarySubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  painStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPainLevel: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 16,
  },
  currentPainValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 48,
    color: '#F97316',
  },
  currentPainLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 10,
  },
  painTrendContainer: {
    flex: 1,
  },
  painTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  trendImproved: {
    color: '#10B981',
  },
  trendWorsened: {
    color: '#EF4444',
  },
  painLocationText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#1E293B',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: '100%',
    width: 16,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
  },
  dayLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  logsSection: {
    marginBottom: 16,
  },
  logsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
  },
  addEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addEntryButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#F97316',
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  logItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logItemHeader: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logDate: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  painLevelBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  painLevelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  logItemBody: {
    padding: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  locationLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
    marginRight: 4,
  },
  locationValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#334155',
  },
  notesText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  rehabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rehabBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  rehabText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#475569',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    marginBottom: 32,
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
});