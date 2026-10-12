'use strict';
// Shared pure rules: use the same rules in server transactions; browser checks are advisory.
window.WusoolRecruitmentPolicy = Object.freeze({
  duration: 30 * 60000,
  overlaps: (a,b) => Date.parse(a.startAt) < Date.parse(b.endAt) && Date.parse(b.startAt) < Date.parse(a.endAt),
  reserves: r => !['cancelled','declined','ended'].includes(r.status),
  current: (a,now=Date.now()) => a.decision !== 'rejected' || now < Date.parse(a.rejectedAt) + 48*3600000,
  joinable: (r,now=Date.now()) => r.mode === 'online' && r.status === 'confirmed' && r.confirmation === 'confirmed' && now >= Date.parse(r.startAt)-30*60000 && now < Date.parse(r.endAt),
});
