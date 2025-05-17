import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Save, Plus, Minus, X } from 'lucide-react-native';
import { addPainLog, getPainLevelColor } from '@/lib/injury';

// Body parts for injury location
const BODY_PARTS = [
  'Head', 'Neck', 'Shoulder', 'Upper Arm', 'Elbow', 'Forearm', 
  'Wrist', 'Hand', 'Chest', 'Upper Back', 'Lower Back', 'Abdomen', 
  'Hip', 'Thigh', 'Knee', 'Calf', 'Ankle', 'Foot'
];

// Common rehab activities
const REHAB_ACTIVITIES = [
  'Ice', 'Heat', 'Rest', 'Elevation', 'Compression', 'Stretching',
  'Massage', 'Light Exercise', 'Foam Rolling', 'Strengthening'
];

export default function AddEntryScreen() {
  const router = useRouter();
  const [painLevel, setPainLevel] = useState(5);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedRehab, setSelectedRehab] = useState([]);
  const [customRehab, setCustomRehab] = useState('');
  const [customRehabItems, setCustomRehabItems] = useState([]);
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    if (!location) {
      alert('Please select an injury location');
      return;
    }
    
    try {
      setSaving(true);
      // Combine selected and custom rehab items
      const rehab = [...selectedRehab, ...customRehabItems];
      
      await addPainLog({
        pain_level: painLevel,
        location,
        notes,
        rehab,
      });
      
      router.replace('/injurylog');
    } catch (error) {
      console.error('Error saving pain log:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const increasePain = () => {
    if (painLevel < 10) {
      setPainLevel(painLevel + 1);
    }
  };
  
  const decreasePain = () => {
    if (painLevel > 0) {
      setPainLevel(painLevel - 1);
    }
  };
  
  const toggleRehabActivity = (activity) => {
    if (selectedRehab.includes(activity)) {
      setSelectedRehab(selectedRehab.filter(item => item !== activity));
    } else {
      setSelectedRehab([...selectedRehab, activity]);
    }
  };
  
  const addCustomRehab = () => {
    if (customRehab.trim() !== '') {
      setCustomRehabItems([...customRehabItems, customRehab.trim()]);
      setCustomRehab('');
    }
  };
  
  const removeCustomRehab = (item) => {
    setCustomRehabItems(customRehabItems.filter(rehab => rehab !== item));
  };
  
  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date</Text>
        <Text style={styles.dateText}>{new Date().toDateString()}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pain Level</Text>
        <Text style={styles.sectionDescription}>
          How severe is your pain today? (0 = no pain, 10 = worst pain)
        </Text>
        
        <View style={styles.painLevelContainer}>
          <TouchableOpacity 
            style={styles.painButton}
            onPress={decreasePain}
          >
            <Minus size={24} color="#64748B" />
          </TouchableOpacity>
          
          <View style={styles.painLevelIndicator}>
            <Text style={[
              styles.painLevelValue,
              { color: getPainLevelColor(painLevel) }
            ]}>
              {painLevel}
            </Text>
            
            <View style={styles.painLevelBar}>
              <View 
                style={[
                  styles.painLevelFill,
                  { 
                    width: `${painLevel * 10}%`,
                    backgroundColor: getPainLevelColor(painLevel)
                  }
                ]}
              />
            </View>
            
            <Text style={styles.painLevelLabel}>
              {painLevel <= 3 ? 'Mild' : painLevel <= 6 ? 'Moderate' : 'Severe'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.painButton}
            onPress={increasePain}
          >
            <Plus size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Injury Location</Text>
        <Text style={styles.sectionDescription}>
          Which body part is affected?
        </Text>
        
        <View style={styles.bodyPartsContainer}>
          {BODY_PARTS.map((part) => (
            <TouchableOpacity 
              key={part}
              style={[
                styles.bodyPartButton,
                location === part && styles.selectedBodyPart
              ]}
              onPress={() => setLocation(part)}
            >
              <Text style={[
                styles.bodyPartText,
                location === part && styles.selectedBodyPartText
              ]}>
                {part}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.sectionDescription}>
          Describe your symptoms, what makes the pain better/worse, etc.
        </Text>
        
        <TextInput
          style={styles.notesInput}
          placeholder="Enter your notes here..."
          multiline={true}
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rehab Activities</Text>
        <Text style={styles.sectionDescription}>
          What treatments or exercises did you do today?
        </Text>
        
        <View style={styles.rehabContainer}>
          {REHAB_ACTIVITIES.map((activity) => (
            <TouchableOpacity 
              key={activity}
              style={[
                styles.rehabButton,
                selectedRehab.includes(activity) && styles.selectedRehab
              ]}
              onPress={() => toggleRehabActivity(activity)}
            >
              <Text style={[
                styles.rehabText,
                selectedRehab.includes(activity) && styles.selectedRehabText
              ]}>
                {activity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.customRehabContainer}>
          <Text style={styles.customRehabTitle}>Add Custom Activities</Text>
          
          <View style={styles.customRehabInputContainer}>
            <TextInput
              style={styles.customRehabInput}
              placeholder="Enter activity..."
              value={customRehab}
              onChangeText={setCustomRehab}
            />
            
            <TouchableOpacity 
              style={styles.addCustomButton}
              onPress={addCustomRehab}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.customRehabList}>
            {customRehabItems.map((item, index) => (
              <View key={index} style={styles.customRehabItem}>
                <Text style={styles.customRehabItemText}>{item}</Text>
                <TouchableOpacity 
                  style={styles.removeCustomButton}
                  onPress={() => removeCustomRehab(item)}
                >
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>
            <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving || !location}
      >
        {saving ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Saving...</Text>
          </>
        ) : (
          <>
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  dateText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#334155',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  painLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  painButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  painLevelIndicator: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  painLevelValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    marginBottom: 4,
  },
  painLevelBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  painLevelFill: {
    height: '100%',
    borderRadius: 4,
  },
  painLevelLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#475569',
  },
  bodyPartsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bodyPartButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
  },
  selectedBodyPart: {
    backgroundColor: '#F97316',
  },
  bodyPartText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#475569',
  },
  selectedBodyPartText: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#334155',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rehabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  rehabButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
  },
  selectedRehab: {
    backgroundColor: '#F97316',
  },
  rehabText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#475569',
  },
  selectedRehabText: {
    color: '#FFFFFF',
  },
  customRehabContainer: {
    marginTop: 8,
  },
  customRehabTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#334155',
    marginBottom: 12,
  },
  customRehabInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  customRehabInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#334155',
    marginRight: 8,
  },
  addCustomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customRehabList: {
    marginTop: 8,
  },
  customRehabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  customRehabItemText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#2563EB',
    flex: 1,
  },
  removeCustomButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});