import { AssetAliasGroup } from './types';

export const DEFAULT_ASSET_ALIAS_GROUPS: AssetAliasGroup[] = [
  {
    canonicalName: 'Фонды',
    aliases: ['Фонд', 'Фонда', 'Фонды', 'Фондов', 'Фонду', 'Фонде', 'Фондом', 'Фондам', 'Фондами', 'Паевой фонд', 'Паевого фонда', 'Паевому фонду', 'Паевые фонды', 'Паевых фондов', 'Паевыми фондами', 'ПИФ', 'ПИФа', 'ПИФы', 'ПИФов', 'Паевой инвестиционный фонд', 'Паевые инвестиционные фонды', 'БПИФ', 'БПИФа', 'БПИФы', 'Биржевой ПИФ', 'Биржевые ПИФы', 'ETF', 'ETFs', 'ETF фонд', 'ETF фонды', 'Investment fund', 'Mutual fund', 'Mutual funds'],
  },
  {
    canonicalName: 'Акции',
    aliases: ['Акция', 'Акций', 'Акцию', 'Акциею', 'Акциям', 'Акциях', 'Акциями', 'Акционерная доля', 'Акционерные доли', 'Доля в компании', 'Доли в компаниях', 'Stock', 'Stocks', 'Stock shares', 'Share', 'Shares', 'Equity', 'Equities'],
  },
  {
    canonicalName: 'Облигации',
    aliases: ['Облигация', 'Облигаци', 'Облигаций', 'Облигацию', 'Облигациею', 'Облигациям', 'Облигациях', 'Облигациями', 'Облигационный заем', 'Долговые бумаги', 'Долговая бумага', 'Фиксированный доход', 'ОФЗ', 'ОФЗы', 'ОФЗ-н', 'Облигации федерального займа', 'Корпоративная облигация', 'Корпоративные облигации', 'Муниципальные облигации', 'Bond', 'Bonds', 'Fixed income', 'Debt securities'],
  },
  {
    canonicalName: 'Рубли',
    aliases: ['Рубль', 'Рубля', 'Рублю', 'Рублем', 'Рубле', 'Рубли', 'Рублей', 'Рублям', 'Рублями', 'Рублях', 'Руб', 'Руб.', 'Рублёвый', 'Рублевый', 'Российский рубль', 'Российские рубли', 'RUB', 'RUR', 'Russian ruble', 'Russian rubles', '₽'],
  },
  {
    canonicalName: 'Доллары США',
    aliases: ['Доллар', 'Доллара', 'Доллару', 'Долларом', 'Доллары', 'Долларов', 'Долларах', 'Долларами', 'Долл', 'Долл.', 'Американский доллар', 'Американские доллары', 'Бакс', 'Бакса', 'Баксы', 'Баксов', 'USD', 'US dollar', 'US dollars', 'United States dollar', '$'],
  },
  {
    canonicalName: 'Евро',
    aliases: ['Евро (€)', 'Евра', 'Евры', 'Евров', 'EUR', 'EURO', 'Euro', 'Euros', '€'],
  },
  {
    canonicalName: 'Юани',
    aliases: ['Юань', 'Юаня', 'Юаню', 'Юанем', 'Юане', 'Юани', 'Юаней', 'Юанями', 'Китайский юань', 'Китайские юани', 'CNY', 'CNH', 'RMB', 'Renminbi', 'Chinese yuan', 'Chinese renminbi', '¥'],
  },
  {
    canonicalName: 'Денежные средства',
    aliases: ['Денежное средство', 'Деньги', 'Денежный остаток', 'Остаток денежных средств', 'Свободные средства', 'Наличные', 'Наличные деньги', 'Кэш', 'Кеш', 'Средства на счете', 'Средства на счету', 'Cash', 'Cash balance', 'Cash equivalent', 'Cash equivalents'],
  },
  {
    canonicalName: 'Золото',
    aliases: ['Золота', 'Золоту', 'Золотом', 'Золотые активы', 'Золотой актив', 'Золотые слитки', 'Инвестиционное золото', 'Gold', 'XAU'],
  },
  {
    canonicalName: 'Криптовалюта',
    aliases: ['Крипта', 'Криптовалюты', 'Криптовалют', 'Криптоактив', 'Криптоактивы', 'Цифровая валюта', 'Цифровые валюты', 'Виртуальная валюта', 'Биткоин', 'Биткойн', 'Bitcoin', 'BTC', 'Ethereum', 'ETH', 'Crypto', 'Cryptocurrency', 'Cryptocurrencies', 'Digital assets'],
  },
  {
    canonicalName: 'Недвижимость',
    aliases: ['Недвижимости', 'Недвижимостью', 'Объект недвижимости', 'Объекты недвижимости', 'Коммерческая недвижимость', 'Жилая недвижимость', 'Фонд недвижимости', 'Фонды недвижимости', 'Real estate', 'Property', 'Properties', 'REIT', 'REITs', 'Real estate investment trust'],
  },
];

const normalizeKey = (name: string) => name.trim().toLocaleLowerCase('ru-RU');

export const mergeDefaultAssetAliasGroups = (
  savedGroups: AssetAliasGroup[],
  defaultGroups: AssetAliasGroup[] = DEFAULT_ASSET_ALIAS_GROUPS,
): AssetAliasGroup[] => {
  const merged = savedGroups.map(group => ({ ...group, aliases: [...group.aliases] }));

  defaultGroups.forEach(defaultGroup => {
    const existing = merged.find(group => normalizeKey(group.canonicalName) === normalizeKey(defaultGroup.canonicalName));
    if (!existing) {
      merged.push({ ...defaultGroup, aliases: [...defaultGroup.aliases] });
      return;
    }

    const existingAliases = new Set([existing.canonicalName, ...existing.aliases].map(normalizeKey));
    defaultGroup.aliases.forEach(alias => {
      const key = normalizeKey(alias);
      if (!existingAliases.has(key)) {
        existing.aliases.push(alias);
        existingAliases.add(key);
      }
    });
  });

  return merged;
};

const formatDisplayName = (name: string) => name
  .trim()
  .toLocaleLowerCase('ru-RU')
  .replace(/(^|[\s-])(\p{L})/gu, (_match, separator: string, letter: string) => `${separator}${letter.toLocaleUpperCase('ru-RU')}`);

export const normalizeAssetName = (
  name: string,
  enabled: boolean,
  aliasGroups: AssetAliasGroup[],
): { key: string; displayName: string } => {
  const trimmedName = name.trim();
  if (!enabled || !trimmedName) {
    return { key: name, displayName: name };
  }

  const key = normalizeKey(trimmedName);
  const matchingGroup = aliasGroups.find(group =>
    [group.canonicalName, ...group.aliases].some(alias => normalizeKey(alias) === key),
  );

  if (matchingGroup) {
    return {
      key: normalizeKey(matchingGroup.canonicalName),
      displayName: matchingGroup.canonicalName.trim(),
    };
  }

  return { key, displayName: formatDisplayName(trimmedName) };
};

export const normalizeAssetTargets = (
  targets: Record<string, number>,
  enabled: boolean,
  aliasGroups: AssetAliasGroup[],
): Record<string, number> => Object.entries(targets).reduce<Record<string, number>>((normalized, [name, percentage]) => {
  const { key } = normalizeAssetName(name, enabled, aliasGroups);
  normalized[key] = (normalized[key] || 0) + percentage;
  return normalized;
}, {});

export const sanitizeAssetAliasGroups = (value: unknown): AssetAliasGroup[] => {
  if (!Array.isArray(value)) {
    return DEFAULT_ASSET_ALIAS_GROUPS;
  }

  const groups = value.flatMap((entry): AssetAliasGroup[] => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const group = entry as { canonicalName?: unknown; aliases?: unknown };
    if (typeof group.canonicalName !== 'string' || !group.canonicalName.trim()) {
      return [];
    }

    const aliases = Array.isArray(group.aliases)
      ? group.aliases.filter((alias): alias is string => typeof alias === 'string' && Boolean(alias.trim()))
      : [];

    return [{ canonicalName: group.canonicalName.trim(), aliases }];
  });

  return groups;
};
