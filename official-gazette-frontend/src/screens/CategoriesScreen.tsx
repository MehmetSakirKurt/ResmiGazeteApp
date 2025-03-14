import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';
import CATEGORIES, { Category } from '../constants/categories';

const CategoriesScreen: React.FC = () => {
  const [subscribedCategories, setSubscribedCategories] = useState<string[]>([]);

  const toggleCategorySubscription = (categoryId: string) => {
    setSubscribedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSubscribed = subscribedCategories.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSubscribed && styles.categoryItemSubscribed,
        ]}
        onPress={() => {
          // Navigation to category detail will be implemented later
          console.log('Navigate to category:', item.id);
        }}
      >
        <View style={styles.categoryHeader}>
          <View style={styles.categoryIconContainer}>
            <MaterialIcons name={item.icon as any} size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
        <Text style={styles.categoryDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.subscriptionContainer}>
          <Text style={styles.subscriptionText}>
            {isSubscribed ? 'Bildirimler Açık' : 'Bildirimler Kapalı'}
          </Text>
          <Switch
            trackColor={{ false: COLORS.disabled, true: `${COLORS.primary}80` }}
            thumbColor={isSubscribed ? COLORS.primary : COLORS.card}
            ios_backgroundColor={COLORS.disabled}
            onValueChange={() => toggleCategorySubscription(item.id)}
            value={isSubscribed}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kategoriler</Text>
        <Text style={styles.headerSubtitle}>
          İlgilendiğiniz kategorileri seçin ve bildirim alın
        </Text>
      </View>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
    paddingBottom: SPACING.m,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.font,
    color: COLORS.text,
    opacity: 0.7,
  },
  listContainer: {
    padding: SPACING.m,
  },
  categoryItem: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.border,
  },
  categoryItemSubscribed: {
    borderLeftColor: COLORS.primary,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.s,
  },
  categoryName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  categoryDescription: {
    fontSize: SIZES.font,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: SPACING.m,
  },
  subscriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  subscriptionText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    opacity: 0.8,
  },
});

export default CategoriesScreen;
