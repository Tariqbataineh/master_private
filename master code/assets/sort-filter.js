'use strict';
(() => {
  if (window.WusoolSort) return;

  const valueAt = (record, field) =>
    String(field || '').split('.').reduce((value, key) => value?.[key], record);
  const text = (value) => String(value ?? '').trim();
  const number = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const time = (value) => {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const emptyLast = (left, right) => {
    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;
    return null;
  };
  const compareValue = (left, right, type, locale) => {
    const normalize = type === 'number' ? number : type === 'date' ? time : text;
    const a = normalize(left), b = normalize(right), missing = emptyLast(a, b);
    if (missing !== null) return missing;
    if (type === 'number' || type === 'date') return a - b;
    return a.localeCompare(b, locale, { numeric: true, sensitivity: 'base' });
  };
  const stable = (records, rules, locale = document.documentElement.lang || 'en') =>
    records
      .map((record, index) => ({ record, index }))
      .sort((left, right) => {
        for (const rule of rules) {
          const leftValue = valueAt(left.record, rule.field);
          const rightValue = valueAt(right.record, rule.field);
          const normalize = rule.type === 'number' ? number : rule.type === 'date' ? time : text;
          const missing = emptyLast(normalize(leftValue), normalize(rightValue));
          if (missing !== null && missing !== 0) return missing;
          const result = compareValue(
            leftValue,
            rightValue,
            rule.type || 'text',
            locale,
          );
          if (result) return rule.direction === 'desc' ? -result : result;
        }
        const idResult = compareValue(left.record?.id, right.record?.id, 'text', locale);
        return idResult || left.index - right.index;
      })
      .map(({ record }) => record);

  window.WusoolSort = { stable, valueAt };
})();
