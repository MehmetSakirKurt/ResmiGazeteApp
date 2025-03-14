import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { GazettePublication } from '../types';
import CATEGORIES from '../constants/categories';

// Mock data for development purposes
const MOCK_PUBLICATIONS: GazettePublication[] = [
  {
    id: '1',
    title: 'Vergi Usul Kanunu Genel Tebliği',
    content: 'Vergi Usul Kanunu Genel Tebliği ile ilgili detaylı içerik...',
    summary: 'Vergi Usul Kanunu Genel Tebliği ile ilgili değişiklikler ve düzenlemeler',
    publishDate: '2025-03-10',
    categories: ['finance-accounting', 'law-compliance'],
    url: 'https://example.com/publication/1',
  },
  {
    id: '2',
    title: 'İş Sağlığı ve Güvenliği Yönetmeliği',
    content: 'İş Sağlığı ve Güvenliği Yönetmeliği ile ilgili detaylı içerik...',
    summary: 'İş Sağlığı ve Güvenliği Yönetmeliği ile ilgili değişiklikler ve düzenlemeler',
    publishDate: '2025-03-09',
    categories: ['health-safety', 'human-resources'],
    url: 'https://example.com/publication/2',
  },
  {
    id: '3',
    title: 'Kişisel Verilerin Korunması Kanunu Uygulama Yönetmeliği',
    content: 'Kişisel Verilerin Korunması Kanunu Uygulama Yönetmeliği ile ilgili detaylı içerik...',
    summary: 'Kişisel Verilerin Korunması Kanunu Uygulama Yönetmeliği ile ilgili değişiklikler',
    publishDate: '2025-03-08',
    categories: ['information-technology', 'law-compliance'],
    url: 'https://example.com/publication/3',
  },
];

const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GazettePublication[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate a search request
    setTimeout(() => {
      // Filter mock data based on search query and selected categories
      const filteredResults = MOCK_PUBLICATIONS.filter((pub) => {
        const matchesQuery = 
          pub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          pub.summary.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategories = 
          selectedCategories.length === 0 || 
          pub.categories.some(cat => selectedCategories.includes(cat));
        
        return matchesQuery && matchesCategories;
      });
      
      setSearchResults(filteredResults);
      setIsSearching(false);
    }, 1000);
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const renderSearchResult = ({ item }: { item: GazettePublication }) => {
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => {
          // @ts-ignore - We'll fix the navigation types later
          navigation.navigate('PublicationDetail', { publication: item });
        }}
      >
        <View style={styles.resultHeader}>
          <Text style={styles.resultDate}>
            {new Date(item.publishDate).toLocaleDateString('tr-TR')}
          </Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => {
              // Toggle favorite logic will be implemented later
              console.log('Toggle favorite for:', item.id);
            }}
          >
            <MaterialIcons
              name={item.isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={item.isFavorite ? COLORS.secondary : COLORS.disabled}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultSummary} numberOfLines={2}>
          {item.summary}
        </Text>
        <View style={styles.categoriesContainer}>
          {item.categories.map((categoryId) => {
            const category = CATEGORIES.find(c => c.id === categoryId);
            return (
              <View key={categoryId} style={styles.categoryTag}>
                <Text style={styles.categoryText}>
                  {category ? category.name : categoryId}
                </Text>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={24} color={COLORS.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Arama yapın..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <MaterialIcons name="clear" size={20} color={COLORS.disabled} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialIcons
            name="filter-list"
            size={24}
            color={selectedCategories.length > 0 ? COLORS.primary : COLORS.text}
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Kategoriler</Text>
          <View style={styles.categoriesFilters}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryFilterItem,
                  selectedCategories.includes(category.id) && styles.categoryFilterItemSelected,
                ]}
                onPress={() => toggleCategoryFilter(category.id)}
              >
                <Text
                  style={[
                    styles.categoryFilterText,
                    selectedCategories.includes(category.id) && styles.categoryFilterTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.dateFilters}>
            <Text style={styles.filtersTitle}>Tarih Aralığı</Text>
            <View style={styles.dateInputsContainer}>
              <TextInput
                style={styles.dateInput}
                placeholder="Başlangıç (GG.AA.YYYY)"
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numeric"
              />
              <Text style={styles.dateInputSeparator}>-</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="Bitiş (GG.AA.YYYY)"
                value={endDate}
                onChangeText={setEndDate}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedCategories([]);
                setStartDate('');
                setEndDate('');
              }}
            >
              <Text style={styles.clearFiltersText}>Filtreleri Temizle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => {
                setShowFilters(false);
                handleSearch();
              }}
            >
              <Text style={styles.applyFiltersText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Aranıyor...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : searchQuery.length > 0 ? (
        <View style={styles.emptyResultsContainer}>
          <MaterialIcons name="search-off" size={64} color={COLORS.disabled} />
          <Text style={styles.emptyResultsText}>Sonuç bulunamadı</Text>
          <Text style={styles.emptyResultsSubtext}>
            Farklı anahtar kelimeler veya filtreler deneyebilirsiniz
          </Text>
        </View>
      ) : (
        <View style={styles.initialStateContainer}>
          <MaterialIcons name="search" size={64} color={COLORS.disabled} />
          <Text style={styles.initialStateText}>
            Resmi Gazete yayınlarında arama yapın
          </Text>
          <Text style={styles.initialStateSubtext}>
            Anahtar kelimeler, kategoriler veya tarih aralığı ile filtreleyebilirsiniz
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.m,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    paddingHorizontal: SPACING.m,
    height: 50,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SPACING.s,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  filterButton: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.s,
    ...SHADOWS.small,
  },
  filtersContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
  },
  filtersTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  categoriesFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.m,
  },
  categoryFilterItem: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.s,
    marginBottom: SPACING.s,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryFilterItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryFilterText: {
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  categoryFilterTextSelected: {
    color: COLORS.card,
  },
  dateFilters: {
    marginBottom: SPACING.m,
  },
  dateInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    paddingHorizontal: SPACING.s,
    fontSize: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateInputSeparator: {
    marginHorizontal: SPACING.s,
    color: COLORS.text,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearFiltersButton: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    marginRight: SPACING.s,
  },
  clearFiltersText: {
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  applyFiltersButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
  },
  applyFiltersText: {
    fontSize: SIZES.small,
    color: COLORS.card,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.m,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  resultsContainer: {
    paddingTop: SPACING.s,
  },
  resultItem: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  resultDate: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  resultTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  resultSummary: {
    fontSize: SIZES.font,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: SPACING.m,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
    borderRadius: SIZES.base,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.s,
    marginBottom: SPACING.xs,
  },
  categoryText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
  },
  emptyResultsText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
  },
  emptyResultsSubtext: {
    fontSize: SIZES.font,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
  },
  initialStateText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
  },
  initialStateSubtext: {
    fontSize: SIZES.font,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default SearchScreen;
