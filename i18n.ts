export type Language = 'ru' | 'en';

export const translate = (language: Language, russian: string, english: string) =>
  language === 'ru' ? russian : english;

export const getSavedLanguage = (): Language => {
  try {
    return window.localStorage.getItem('appLanguage') === 'en' ? 'en' : 'ru';
  } catch (error) {
    console.error('Failed to load language setting:', error);
    return 'ru';
  }
};
