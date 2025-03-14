import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { GazettePublication } from '../types';
import { RootStackParamList } from '../navigation/types';

type PublicationDetailRouteProp = RouteProp<RootStackParamList, 'PublicationDetail'>;

const PublicationDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PublicationDetailRouteProp>();
  const { publication } = route.params;
  
  const [isFavorite, setIsFavorite] = useState(publication.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, we would update this in a database or Redux store
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${publication.title}\n\n${publication.summary}\n\nDaha fazla bilgi için: ${publication.url}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categoryId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.date}>
            {new Date(publication.publishDate).toLocaleDateString('tr-TR')}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={toggleFavorite}
            >
              <MaterialIcons
                name={isFavorite ? 'favorite' : 'favorite-border'}
                size={24}
                color={isFavorite ? COLORS.secondary : COLORS.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.title}>{publication.title}</Text>

        <View style={styles.categoriesContainer}>
          {publication.categories.map((categoryId) => (
            <View key={categoryId} style={styles.categoryTag}>
              <Text style={styles.categoryText}>
                {getCategoryName(categoryId)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Özet</Text>
          <Text style={styles.summaryText}>{publication.summary}</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.contentTitle}>İçerik</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>İçerik yükleniyor...</Text>
            </View>
          ) : (
            <Text style={styles.contentText}>{publication.content}</Text>
          )}
        </View>

        <View style={styles.sourceContainer}>
          <Text style={styles.sourceTitle}>Kaynak</Text>
          <TouchableOpacity>
            <Text style={styles.sourceLink}>{publication.url}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.relatedContainer}>
          <Text style={styles.relatedTitle}>İlgili Yayınlar</Text>
          <View style={styles.relatedPlaceholder}>
            <Text style={styles.relatedPlaceholderText}>
              İlgili yayınlar bulunamadı
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('ChatDetail', {
              initialQuestion: `"${publication.title}" hakkında bilgi verir misin?`
            });
          }}
        >
          <MaterialIcons name="chat" size={24} color={COLORS.card} />
          <Text style={styles.chatButtonText}>Asistana Sor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.l,
    paddingBottom: 80, // Extra padding for bottom bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  date: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.s,
    marginLeft: SPACING.s,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.l,
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
  summaryContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.l,
    ...SHADOWS.small,
  },
  summaryTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  summaryText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 22,
  },
  contentContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.l,
    ...SHADOWS.small,
  },
  contentTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  contentText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.l,
  },
  loadingText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    marginTop: SPACING.m,
  },
  sourceContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.l,
    ...SHADOWS.small,
  },
  sourceTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  sourceLink: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  relatedContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    ...SHADOWS.small,
  },
  relatedTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  relatedPlaceholder: {
    alignItems: 'center',
    paddingVertical: SPACING.l,
  },
  relatedPlaceholderText: {
    fontSize: SIZES.font,
    color: COLORS.disabled,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    padding: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    paddingVertical: SPACING.m,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    color: COLORS.card,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    marginLeft: SPACING.s,
  },
});

export default PublicationDetailScreen;
