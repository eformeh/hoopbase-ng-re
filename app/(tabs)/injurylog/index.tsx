import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Clipboard, Calendar, ChartLine as LineChart, Plus, ArrowDown, ArrowUp, FileText, CreditCard as Edit } from 'lucide-react-native';
import { fetchPainLogs, getPainLevelColor, getPainLevelLabel, getWeeklyTrend, type PainLog } from '@/lib/injury';
import { useTheme } from '@/hooks/useTheme';

export default function InjuryLogScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month'
  const [painLogs, setPainLogs] = useState<PainLog[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  async function loadData(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const logs = await fetchPainLogs();
      setPainLogs(logs);
      
      const trend = await getWeeklyTrend();
      setWeeklyTrend(trend);
    } catch (error) {
      console.error('Error loading injury data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }
  
  // Calculate current trend (up or down)
  const latestTwoEntries = painLogs.slice(0, 2);
  const trend = latestTwoEntries.length === 2 
    ? latestTwoEntries[0].pain_level - latestTwoEntries[1].pain_level 
    : 0;
  
  const renderLogItem = ({ item }: { item: PainLog }) => (
    <TouchableOpacity 
      style={[styles.logItem, isDark && styles.logItemDark]}
      onPress={() => router.push({
        pathname: '/injurylog/entry-details',
        params: { id: item.id }
      })}
    >
      <View style={[styles.logItemHeader, isDark && styles.logItemHeaderDark]}>
        <Text style={[styles.logDate, isDark && styles.logDateDark]}>{item.date}</Text>
        <View style={[
          styles.painLevelBadge,
          { backgroundColor: `${getPainLevelColor(item.pain_level)}20` }
        ]}>
          <Text style={[
            styles.painLevelText,
            { color: getPainLevelColor(item.pain_level) }
          ]}>
            {getPainLevelLabel(item.pain_level)} Pain ({item.pain_level}/10)
          </Text>
        </View>
      </View>
      
      <View style={styles.logItemBody}>
        <View style={styles.locationContainer}>
          <Text style={[styles.locationLabel, isDark && styles.locationLabelDark]}>Location:</Text>
          <Text style={[styles.locationValue, isDark && styles.locationValueDark]}>{item.location}</Text>
        </View>
        
        <Text style={[styles.notesText, isDark && styles.notesTextDark]} numberOfLines={2}>{item.notes}</Text>
        
        <View style={styles.rehabContainer}>
          {item.rehab.map((task, index) => (
            <View key={index} style={[styles.rehabBadge, isDark && styles.rehabBadgeDark]}>
              <Text style={[styles.rehabText, isDark && styles.rehabTextDark]}>{task}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Loading your pain logs...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={isDark ? '#F97316' : '#64748B'}
          />
        }
      >
        {/* Summary Card */}
        <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={[styles.summaryTitle, isDark && styles.summaryTitleDark]}>Current Pain Status</Text>
              <Text style={[styles.summarySubtitle, isDark && styles.summarySubtitleDark]}>Based on your recent logs</Text>
            </View>
            <Clipboard size={24} color={isDark ? '#94A3B8' : '#64748B'} />
          </View>
          
          {painLogs.length > 0 ? (
            <View style={styles.painStatusContainer}>
              <View style={styles.currentPainLevel}>
                <Text style={[styles.currentPainValue, isDark && styles.currentPainValueDark]}>{painLogs[0].pain_level}</Text>
                <Text style={[styles.currentPainLabel, isDark && styles.currentPainLabelDark]}>/10</Text>
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
                    <Text style={[styles.trendText, isDark && styles.trendTextDark]}>No change</Text>
                  )}
                </View>
                
                <Text style={[styles.painLocationText, isDark && styles.painLocationTextDark]}>
                  Primary: {painLogs[0].location}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, isDark && styles.noDataTextDark]}>
                No pain logs yet. Add your first entry!
              </Text>
            </View>
          )}
        </View>
        
        {/* Weekly Trend Chart */}
        <View style={[styles.chartCard, isDark && styles.chartCardDark]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, isDark && styles.chartTitleDark]}>7-Day Pain Trend</Text>
            <Calendar size={20} color={isDark ? '#94A3B8' : '#64748B'} />
          </View>
          
          <View style={styles.chartContainer}>
            {weeklyTrend.map((item, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: `${item.value ? (item.value * 10) : 0}%`,
                        backgroundColor: getPainLevelColor(item.value)
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.dayLabel, isDark && styles.dayLabelDark]}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Pain Logs List */}
        <View style={styles.logsSection}>
          <View style={styles.logsSectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Pain Log Entries</Text>
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
                isDark && styles.filterButtonDark,
                filter === 'all' && styles.activeFilterButton
              ]}
              onPress={() => setFilter('all')}
            >
              <Text style={[
                styles.filterText,
                isDark && styles.filterTextDark,
                filter === 'all' && styles.activeFilterText
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton,
                isDark && styles.filterButtonDark,
                filter === 'week' && styles.activeFilterButton
              ]}
              onPress={() => setFilter('week')}
            >
              <Text style={[
                styles.filterText,
                isDark && styles.filterTextDark,
                filter === 'week' && styles.activeFilterText
              ]}>
                Last Week
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton,
                isDark && styles.filterButtonDark,
                filter === 'month' && styles.activeFilterButton
              ]}
              onPress={() => setFilter('month')}
            >
              <Text style={[
                styles.filterText,
                isDark && styles.filterTextDark,
                filter === 'month' && styles.activeFilterText
              ]}>
                Last Month
              </Text>
            </TouchableOpacity>
          </View>
          
          {painLogs.length > 0 ? (
            <FlatList
              data={painLogs}
              renderItem={renderLogItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noLogsContainer}>
              <Text style={[styles.noLogsText, isDark && styles.noLogsTextDark]}>
                No pain logs found. Add your first entry to start tracking.
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={[styles.actionButton, isDark && styles.actionButtonDark]}>
            <FileText size={20} color="#F97316" />
            <Text style={styles.actionButtonText}>Export Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, isDark && styles.actionButtonDark]}>
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
  containerDark: {
    backgroundColor: '#0F172A',
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
  summaryCardDark: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.3,
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
  summaryTitleDark: {
    color: '#F8FAFC',
  },
  summarySubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  summarySubtitleDark: {
    color: '#94A3B8',
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
  currentPainValueDark: {
    color: '#FB923C',
  },
  currentPainLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 10,
  },
  currentPainLabelDark: {
    color: '#CBD5E1',
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
  trendTextDark: {
    color: '#94A3B8',
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
  painLocationTextDark: {
    color: '#F8FAFC',
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
  chartCardDark: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0.3,
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
  chartTitleDark: {
    color: '#F8FAFC',
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
    backgroundColor: isDark ? '#334155' : '#F1F5F9',
    borderRadius: 8,
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
  dayLabelDark: {
    color: '#94A3B8',
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
  sectionTitleDark: {
    color: '#F8FAFC',
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
  filterButtonDark: {
    backgroundColor: '#334155',
  },
  activeFilterButton: {
    backgroundColor: '#F97316',
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  filterTextDark: {
    color: '#94A3B8',
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
  logItemDark: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0.3,
  },
  logItemHeader: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logItemHeaderDark: {
    backgroundColor: '#334155',
    borderBottomColor: '#475569',
  },
  logDate: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  logDateDark: {
    color: '#E2E8F0',
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
  locationLabelDark: {
    color: '#94A3B8',
  },
  locationValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#334155',
  },
  locationValueDark: {
    color: '#E2E8F0',
  },
  notesText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  notesTextDark: {
    color: '#CBD5E1',
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
  rehabBadgeDark: {
    backgroundColor: '#334155',
  },
  rehabText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#475569',
  },
  rehabTextDark: {
    color: '#CBD5E1',
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
  actionButtonDark: {
    backgroundColor: '#451A03',
  },
  actionButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#F97316',
    marginLeft: 8,
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
  loadingTextDark: {
    color: '#94A3B8',
  },
  noLogsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noLogsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  noLogsTextDark: {
    color: '#94A3B8',
  },
});