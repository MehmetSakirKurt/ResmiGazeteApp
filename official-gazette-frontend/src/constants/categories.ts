export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string; // We'll use icon names from a library we'll add later
}

const CATEGORIES: Category[] = [
  {
    id: 'law-compliance',
    name: 'Hukuk ve Uyum',
    description: 'Yasal düzenlemeler, uyum gereklilikleri, yeni kanunlar, değişiklikler vb.',
    icon: 'gavel',
  },
  {
    id: 'finance-accounting',
    name: 'Finans ve Muhasebe',
    description: 'Finansal düzenlemeler, vergi değişiklikleri, muhasebe standartları vb.',
    icon: 'calculator',
  },
  {
    id: 'human-resources',
    name: 'İnsan Kaynakları',
    description: 'İş kanunları, çalışan hakları, işyeri düzenlemeleri vb.',
    icon: 'people',
  },
  {
    id: 'management-admin',
    name: 'Yönetim ve İdari Departmanlar',
    description: 'Yönetim ve idari departmanlarla ilgili düzenlemeler ve duyurular',
    icon: 'business',
  },
  {
    id: 'purchasing-logistics',
    name: 'Satın Alma ve Lojistik',
    description: 'Tedarik zinciri, satın alma süreçleri ve lojistik ile ilgili düzenlemeler',
    icon: 'local-shipping',
  },
  {
    id: 'information-technology',
    name: 'Bilgi Teknolojileri',
    description: 'BT ile ilgili düzenlemeler, veri koruma, dijital dönüşüm vb.',
    icon: 'computer',
  },
  {
    id: 'health-safety',
    name: 'İş Sağlığı ve Güvenliği',
    description: 'İş sağlığı ve güvenliği ile ilgili düzenlemeler ve standartlar',
    icon: 'health-and-safety',
  },
  {
    id: 'foreign-trade',
    name: 'Dış Ticaret',
    description: 'İhracat, ithalat, gümrük ve dış ticaret ile ilgili düzenlemeler',
    icon: 'public',
  },
  {
    id: 'quality',
    name: 'Kalite',
    description: 'Kalite standartları, sertifikasyon ve kalite yönetimi ile ilgili düzenlemeler',
    icon: 'verified',
  },
];

export default CATEGORIES;
