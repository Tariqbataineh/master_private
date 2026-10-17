'use strict';
// Explicit user-approved password policy (including login): 6+, uppercase, number, @ or _.
window.WusoolPasswordPolicy = Object.freeze({
  profiles: Object.fromEntries(
    ['userRegistration', 'organizationRegistration', 'reset', 'change', 'login'].map((k) => [
      k,
      { minLength: 6, uppercase: true, number: true, specificSymbol: true },
    ]),
  ),
  rules(profile) {
    const p = this.profiles[profile] || this.profiles.reset;
    return [
      { key: 'length', test: (s) => s.length >= p.minLength, length: p.minLength },
      ...(p.uppercase ? [{ key: 'uppercase', test: (s) => /[A-Z]/.test(s) }] : []),
      ...(p.number ? [{ key: 'number', test: (s) => /\d/.test(s) }] : []),
      ...(p.specificSymbol ? [{ key: 'specificSymbol', test: (s) => /[@_]/.test(s) }] : []),
    ];
  },
  accepts(value, profile) {
    return this.rules(profile).every((r) => r.test(String(value)));
  },
});
