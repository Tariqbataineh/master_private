'use strict';
window.WusoolMeetingProvider = Object.freeze({
  inspectLink(value) {
    let u; try {u=new URL(value);} catch {throw Error('Enter a valid HTTPS meeting URL.');}
    if(u.protocol!=='https:' || u.username || u.password) throw Error('Only HTTPS meeting URLs are accepted.');
    const h=u.hostname.toLowerCase();
    const provider=h==='teams.microsoft.com'||h==='teams.live.com'?'teams':h==='meet.jit.si'?'jitsi':null;
    if(!provider) throw Error('Use an explicit Microsoft Teams or Jitsi meeting link.');
    return {provider,joinUrl:u.href,state:'manual-link',admission:'server-enforcement-required'};
  },
  async create() {throw Object.assign(Error('Meeting creation awaits backend/provider configuration. No meeting was created.'),{code:'MEETING_NOT_CONFIGURED'});},
  async update() {throw Object.assign(Error('Provider meeting updates require the configured backend.'),{code:'MEETING_NOT_CONFIGURED'});},
  async cancel() {throw Object.assign(Error('Provider cancellation requires the configured backend; revoke admission there.'),{code:'MEETING_NOT_CONFIGURED'});},
});
