from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'reference'
api=json.loads((SOURCE/'openapi.json').read_text()); schemas=api['components']['schemas']
tables={}; maps={}
def col(name,typ='nvarchar(128)',required=False,default=None):return dict(name=name,type=typ,required=required,default=default)
def table(name,entity,columns,record=True,key=None):
 base=[col('Id',required=True),col('Revision','int',True,'1'),col('CreatedAt','datetimeoffset(7)',True,'SYSUTCDATETIME()'),col('UpdatedAt','datetimeoffset(7)',True,'SYSUTCDATETIME()'),col('IsDeleted','bit',True,'0'),col('RowVersion','rowversion',True)] if record else []
 tables[name]={'entity':entity,'columns':base+columns,'key':key or ['Id'],'checks':[],'indexes':[],'foreignKeys':[],'alternateKeys':[]}
 return tables[name]
def fk(t,cols,parent,pc=None,nav=None,inverse=None,one=False):
 cols=[cols] if isinstance(cols,str) else cols;pc=pc or ['Id'];tables[t]['foreignKeys'].append(dict(columns=cols,parent=parent,parentColumns=pc,nav=nav or parent.rstrip('s'),inverse=inverse,one=one))
def ix(t,cols,unique=False,filter=None):tables[t]['indexes'].append(dict(columns=cols.split(',') if isinstance(cols,str) else cols,unique=unique,filter=filter))
def ck(t,sql):tables[t]['checks'].append(sql)
def ak(t,cols):tables[t]['alternateKeys'].append(cols)
def csharpname(s):return s[:1].upper()+s[1:]
def fields(dto,exclude=(),rename={}):
 out=[];mapping={}
 for k,v in schemas[dto].get('properties',{}).items():
  if k in ['id','revision','createdAt','updatedAt','isDeleted'] or k in exclude:continue
  name=rename.get(k,csharpname(k));fmt=v.get('format');ty=v.get('type')
  if fmt=='date-time':typ='datetimeoffset(7)'
  elif fmt=='date':typ='date'
  elif ty=='boolean':typ='bit'
  elif ty=='integer':typ='int'
  elif ty=='number':typ='decimal(18,6)'
  elif ty=='string':typ='nvarchar(128)' if k.endswith('Id') or k.endswith('By') else 'nvarchar('+str(min(v.get('maxLength',500),2000))+')'
  else:typ='nvarchar(max)';name=name+'Json' if not name.endswith('Json') else name
  out.append(col(name,typ));mapping[k]=name
 maps[dto]=mapping
 return out
# ASP.NET Core Identity credentials stay server-only. Identity User/Role IDs are opaque strings.
identity=[col('UserName','nvarchar(256)'),col('NormalizedUserName','nvarchar(256)'),col('Email','nvarchar(256)'),col('NormalizedEmail','nvarchar(256)'),col('EmailConfirmed','bit',True,'0'),col('PasswordHash','nvarchar(max)'),col('SecurityStamp','nvarchar(max)'),col('ConcurrencyStamp','nvarchar(max)'),col('PhoneNumber','nvarchar(50)'),col('PhoneNumberConfirmed','bit',True,'0'),col('TwoFactorEnabled','bit',True,'0'),col('LockoutEnd','datetimeoffset(7)'),col('LockoutEnabled','bit',True,'1'),col('AccessFailedCount','int',True,'0')]
account=fields('AccountDto',exclude={'role','email','phoneNumber','authenticationStatus','organizationName','fullName','savedPlaces','workingHours','specialHours','closedDates','hoursUpdatedAt','hoursRevision'},rename={'phone':'ContactPhone'})
table('AspNetUsers','ApplicationUser',identity+account+[col('RoleCode','nvarchar(20)',True,"N'User'"),col('BlockedAt','datetimeoffset(7)'),col('BlockedById'),col('BlockReason','nvarchar(1000)'),col('TermsAcceptedAt','datetimeoffset(7)')]);
for c in tables['AspNetUsers']['columns']:
 if c['name']=='Status':c.update(required=True,default="N'pending'")
 if c['name']=='Name':c.update(required=True)
ck('AspNetUsers',"[RoleCode] IN (N'User',N'Organization',N'Admin')")
ck('AspNetUsers',"[Status] IN (N'active',N'pending',N'rejected',N'blocked',N'suspended',N'disabled')")
ck('AspNetUsers',"[ApprovalStatus] IS NULL OR [ApprovalStatus] IN (N'pending',N'approved',N'rejected')")
ix('AspNetUsers','NormalizedEmail',True,'[NormalizedEmail] IS NOT NULL');ix('AspNetUsers','NormalizedUserName',True,'[NormalizedUserName] IS NOT NULL');fk('AspNetUsers','BlockedById','AspNetUsers',nav='BlockedBy')
table('AspNetRoles','IdentityRole',[col('Id',required=True),col('Name','nvarchar(256)'),col('NormalizedName','nvarchar(256)'),col('ConcurrencyStamp','nvarchar(max)')],False);ix('AspNetRoles','NormalizedName',True,'[NormalizedName] IS NOT NULL')
for n,e,cs,key in [
 ('AspNetUserRoles','IdentityUserRole<string>',[col('UserId',required=True),col('RoleId',required=True)],['UserId','RoleId']),
 ('AspNetUserClaims','IdentityUserClaim<string>',[col('Id','int IDENTITY(1,1)',True),col('UserId',required=True),col('ClaimType','nvarchar(max)'),col('ClaimValue','nvarchar(max)')],['Id']),
 ('AspNetRoleClaims','IdentityRoleClaim<string>',[col('Id','int IDENTITY(1,1)',True),col('RoleId',required=True),col('ClaimType','nvarchar(max)'),col('ClaimValue','nvarchar(max)')],['Id']),
 ('AspNetUserLogins','IdentityUserLogin<string>',[col('LoginProvider',required=True),col('ProviderKey',required=True),col('ProviderDisplayName','nvarchar(max)'),col('UserId',required=True)],['LoginProvider','ProviderKey']),
 ('AspNetUserTokens','IdentityUserToken<string>',[col('UserId',required=True),col('LoginProvider',required=True),col('Name',required=True),col('Value','nvarchar(max)')],['UserId','LoginProvider','Name'])]:
 table(n,e,cs,False,key)
 for c in cs:
  if c['name']=='UserId':fk(n,'UserId','AspNetUsers',nav='Account')
  if c['name']=='RoleId':fk(n,'RoleId','AspNetRoles',nav='Role')
table('Organizations','Organization',[col('AccountId',required=True),col('HoursRevision','int',True,'0'),col('HoursUpdatedAt','datetimeoffset(7)')]);fk('Organizations','AccountId','AspNetUsers',nav='Account',inverse='Organization',one=True);ix('Organizations','AccountId',True);ck('Organizations','[Id] = [AccountId]')
table('OrganizationMemberships','OrganizationMembership',[col('OrganizationId',required=True),col('AccountId',required=True),col('Role','nvarchar(30)',True,"N'owner'"),col('Active','bit',True,'1')]);fk('OrganizationMemberships','OrganizationId','Organizations',nav='Organization',inverse='Memberships');fk('OrganizationMemberships','AccountId','AspNetUsers',nav='Account',inverse='Memberships');ix('OrganizationMemberships','OrganizationId,AccountId',True);ck('OrganizationMemberships',"[Role] IN (N'owner',N'manager',N'staff')")
table('OrganizationApplications','OrganizationApplication',[col('OrganizationId',required=True),col('Status','nvarchar(30)',True,"N'pending'"),col('SubmittedById',required=True),col('ReviewedById'),col('ReviewedAt','datetimeoffset(7)'),col('Reason','nvarchar(1000)'),col('SnapshotJson','nvarchar(max)')]);fk('OrganizationApplications','OrganizationId','Organizations',nav='Organization',inverse='Applications');fk('OrganizationApplications','SubmittedById','AspNetUsers',nav='SubmittedBy');fk('OrganizationApplications','ReviewedById','AspNetUsers',nav='ReviewedBy')
bex={'organizationId','branchName','phoneNumber','services','destinations','workingHours','holidays','closures','accessibility','photos','aiReview','analysisId','completedSteps','expectedRevision','reason','specialHours','closedDates','ticketServices'}
table('Branches','Branch',fields('BranchDto',bex)+[col('OrganizationId',required=True),col('TicketServicesConfigured','bit',True,'0'),col('BookingConfigurationJson','nvarchar(max)'),col('ClosuresJson','nvarchar(max)'),col('DetailsCompleted','bit',True,'0'),col('HoursCompleted','bit',True,'0'),col('AccessibilityCompleted','bit',True,'0'),col('PhotosCompleted','bit',True,'0'),col('AiReviewCompleted','bit',True,'0'),col('CurrentAnalysisId')]);fk('Branches','OrganizationId','Organizations',nav='Organization',inverse='Branches');ak('Branches',['Id','OrganizationId']);ix('Branches','OrganizationId,Status,IsDeleted');ck('Branches',"[Status] IN (N'draft',N'pending',N'approved',N'published',N'rejected',N'suspended',N'changes-requested')");fk('Branches','ReviewedBy','AspNetUsers',nav='Reviewer')
for owner,parent in [('Organization','Organizations'),('Branch','Branches')]:
 for suffix,entity,cs in [('Hours',owner+'Hours',[col('DayOfWeek','tinyint',True),col('IsOpen','bit',True,'0'),col('OpenTime','time(0)'),col('CloseTime','time(0)')]),('SpecialDates',owner+'SpecialDate',[col('Date','date',True),col('Status','nvarchar(20)',True),col('OpenTime','time(0)'),col('CloseTime','time(0)'),col('Note','nvarchar(300)')])]:
  tn=owner+suffix;table(tn,entity,[col(owner+'Id',required=True)]+cs);fk(tn,owner+'Id',parent,nav=owner,inverse='WorkingHours' if suffix=='Hours' else 'SpecialDates');ix(tn,owner+'Id,'+('DayOfWeek' if suffix=='Hours' else 'Date'),True)
  if suffix=='Hours':ck(tn,'[DayOfWeek] BETWEEN 0 AND 6');ck(tn,'([IsOpen] = 0 AND [OpenTime] IS NULL AND [CloseTime] IS NULL) OR ([IsOpen] = 1 AND [OpenTime] IS NOT NULL AND [CloseTime] IS NOT NULL AND [OpenTime] < [CloseTime])')
  else:ck(tn,"([Status] = N'closed' AND [OpenTime] IS NULL AND [CloseTime] IS NULL) OR ([Status] = N'custom' AND [OpenTime] IS NOT NULL AND [CloseTime] IS NOT NULL AND [OpenTime] < [CloseTime])")
table('BranchServices','BranchService',[col('BranchId',required=True),col('Name','nvarchar(120)',True),col('Description','nvarchar(500)'),col('Active','bit',True,'1'),col('Available','bit',True,'1'),col('NormalizedName','nvarchar(120)',True)]);fk('BranchServices','BranchId','Branches',nav='Branch',inverse='TicketServices');ak('BranchServices',['Id','BranchId']);ix('BranchServices','BranchId,NormalizedName',True,'[IsDeleted] = 0')
for tn,en in [('BranchLegacyServices','BranchLegacyService'),('BranchDestinations','BranchDestination')]:
 table(tn,en,[col('BranchId',required=True),col('Name','nvarchar(120)',True),col('SortOrder','int',True,'0'),col('LegacyPayloadJson','nvarchar(max)')]);fk(tn,'BranchId','Branches',nav='Branch',inverse='LegacyServices' if 'Legacy' in tn else 'Destinations');ix(tn,'BranchId,Name',True)
table('AccessibilityRequirements','AccessibilityRequirement',[col('Key','nvarchar(100)',True),col('Title','nvarchar(200)',True),col('Description','nvarchar(1000)'),col('Icon','nvarchar(100)'),col('Category','nvarchar(100)'),col('Weight','decimal(9,4)',True,'1'),col('Required','bit',True,'0'),col('Enabled','bit',True,'1')]);ix('AccessibilityRequirements','Key',True);ck('AccessibilityRequirements','[Weight] >= 0')
table('BranchAccessibility','BranchAccessibility',[col('BranchId',required=True),col('RequirementId',required=True),col('Value','nvarchar(30)',True),col('Notes','nvarchar(1000)')]);fk('BranchAccessibility','BranchId','Branches',nav='Branch',inverse='Accessibility');fk('BranchAccessibility','RequirementId','AccessibilityRequirements',nav='Requirement');ix('BranchAccessibility','BranchId,RequirementId',True);ck('BranchAccessibility',"[Value] IN (N'available',N'not-available',N'not-sure',N'yes',N'no',N'unknown')")
table('Documents','Document',fields('DocumentDto',{'expectedRevision','reason'}));fk('Documents','OwnerId','AspNetUsers',nav='Owner',inverse='Documents');fk('Documents','OrganizationId','Organizations',nav='Organization');fk('Documents','BranchId','Branches',nav='Branch');ix('Documents','OwnerId,CreatedAt');
table('BranchPhotos','BranchPhoto',[col('BranchId',required=True)]+fields('PhotoDto',{'imageData','documentId'})+[col('DocumentId',required=True),col('SortOrder','int',True,'0')]);fk('BranchPhotos','BranchId','Branches',nav='Branch',inverse='Photos');fk('BranchPhotos','DocumentId','Documents',nav='Document');ix('BranchPhotos','BranchId,CategoryKey');ck('BranchPhotos',"[CategoryKey] IN (N'main-entrance',N'entrance-route',N'internal-pathway',N'destination-area')")
fk('AspNetUsers','DocumentId','Documents',nav='RegistrationDocument')
table('BranchAnalyses','BranchAnalysis',fields('AnalysisDto',{'branchId'})+[col('BranchId',required=True)]);fk('BranchAnalyses','BranchId','Branches',nav='Branch',inverse='Analyses');ix('BranchAnalyses','BranchId,GeneratedAt');ck('BranchAnalyses','[Score] IS NULL OR [Score] BETWEEN 0 AND 100');ck('BranchAnalyses','[Confidence] IS NULL OR [Confidence] BETWEEN 0 AND 1')
bexclude={'branchId','userId','organizationId','placeId','visitDate','visitTime','branch','placeName','branchName','visitorName','visitorEmail','visitorPhone','expectedRevision','journeyHistory','appointmentProposal','qrVerified','queue','reviewed'}
bcols=fields('BookingDto',bexclude,{'date':'VisitDate','time':'VisitTime'})
for c in bcols:
 if c['name']=='VisitDate':c.update(type='date',required=True)
 if c['name']=='VisitTime':c.update(type='time(0)',required=True)
 if c['name']=='Reference':c.update(type='nvarchar(80)',required=True)
 if c['name']=='DurationMinutes':c.update(required=True,default='30')
 if c['name']=='Status':c.update(required=True,default="N'pending'")
 if c['name']=='JourneyState':c.update(required=True,default="N'not-started'")
 if c['name']=='TimeZone':c.update(required=True,default="N'Asia/Amman'")
table('Bookings','Booking',bcols+[col('BranchId',required=True),col('OrganizationId',required=True),col('UserId',required=True),col('QueueNumber','int'),col('QueueCalledById'),col('QueueCalledAt','datetimeoffset(7)')]);fk('Bookings',['BranchId','OrganizationId'],'Branches',['Id','OrganizationId'],nav='Branch',inverse='Bookings');fk('Bookings','OrganizationId','Organizations',nav='Organization');fk('Bookings','UserId','AspNetUsers',nav='User',inverse='Bookings');fk('Bookings',['ServiceId','BranchId'],'BranchServices',['Id','BranchId'],nav='Service');fk('Bookings','QueueCalledById','AspNetUsers',nav='QueueCalledBy');ak('Bookings',['Id','UserId','BranchId']);ix('Bookings','Reference',True);ix('Bookings','BranchId,VisitDate,VisitTime,Status');ix('Bookings','UserId,VisitDate,Status');ix('Bookings','BranchId,VisitDate,QueueNumber',True,'[QueueNumber] IS NOT NULL AND [IsDeleted] = 0');ck('Bookings','[DurationMinutes] BETWEEN 15 AND 120');ck('Bookings',"[TimeZone] = N'Asia/Amman'");ck('Bookings',"[Status] IN (N'pending',N'confirmed',N'in-progress',N'completed',N'cancelled',N'no-show',N'waitlisted')");ck('Bookings',"[JourneyState] IN (N'not-started',N'on-the-way',N'arrived',N'serving',N'completed',N'cancelled',N'no-show')")
table('BookingHistory','BookingHistory',[col('BookingId',required=True),col('Event','nvarchar(80)',True),col('FromState','nvarchar(30)'),col('ToState','nvarchar(30)'),col('ActorId'),col('ActorRole','nvarchar(20)'),col('ActorName','nvarchar(120)'),col('Reason','nvarchar(1000)'),col('At','datetimeoffset(7)',True,'SYSUTCDATETIME()')]);fk('BookingHistory','BookingId','Bookings',nav='Booking',inverse='JourneyHistory');fk('BookingHistory','ActorId','AspNetUsers',nav='Actor');ix('BookingHistory','BookingId,At')
table('AppointmentProposals','AppointmentProposal',[col('BookingId',required=True),col('BranchId',required=True),col('OrganizationId',required=True),col('UserId',required=True),col('ServiceId'),col('ServiceName','nvarchar(120)'),col('ServiceSnapshotJson','nvarchar(max)'),col('VisitDate','date',True),col('VisitTime','time(0)',True),col('RequiresAssistant','bit',True,'0'),col('DurationMinutes','int',True,'30'),col('Reason','nvarchar(1000)'),col('ExpiresAt','datetimeoffset(7)',True),col('Status','nvarchar(30)',True,"N'pending'"),col('RespondedAt','datetimeoffset(7)')]);fk('AppointmentProposals','BookingId','Bookings',nav='Booking',inverse='AppointmentProposals');fk('AppointmentProposals',['BranchId','OrganizationId'],'Branches',['Id','OrganizationId'],nav='Branch');fk('AppointmentProposals','UserId','AspNetUsers',nav='User');fk('AppointmentProposals',['ServiceId','BranchId'],'BranchServices',['Id','BranchId'],nav='Service');ix('AppointmentProposals','BookingId',True,"[Status] = N'pending' AND [IsDeleted] = 0");ck('AppointmentProposals',"[Status] IN (N'pending',N'accepted',N'rejected',N'expired',N'superseded')")
table('VisitPasses','VisitPass',[col('BookingId',required=True),col('TokenHash','binary(32)',True),col('ExpiresAt','datetimeoffset(7)',True),col('VerifiedById'),col('VerifiedAt','datetimeoffset(7)'),col('UsedAt','datetimeoffset(7)'),col('RevokedAt','datetimeoffset(7)')]);fk('VisitPasses','BookingId','Bookings',nav='Booking',inverse='Passes');fk('VisitPasses','VerifiedById','AspNetUsers',nav='VerifiedBy');ix('VisitPasses','TokenHash',True);ix('VisitPasses','BookingId',True,'[RevokedAt] IS NULL AND [UsedAt] IS NULL AND [IsDeleted] = 0')
table('Reviews','Review',fields('ReviewDto',{'placeId','visitId','branch','name','date','placeName','expectedRevision','reason','reviewText','organizationId','bookingId','userId','branchId'})+[col('BookingId',required=True),col('UserId',required=True),col('BranchId',required=True)]);fk('Reviews',['BookingId','UserId','BranchId'],'Bookings',['Id','UserId','BranchId'],nav='Booking',inverse='Reviews');fk('Reviews','UserId','AspNetUsers',nav='User',inverse='Reviews');fk('Reviews','BranchId','Branches',nav='Branch',inverse='Reviews');fk('Reviews','ApprovedBy','AspNetUsers',nav='Moderator');ix('Reviews','BookingId',True,'[IsDeleted] = 0');ix('Reviews','BranchId,Status,IsDeleted');ck('Reviews','[Rating] BETWEEN 1 AND 5');ck('Reviews',"[Status] IN (N'Pending',N'Visible',N'Hidden',N'Rejected')")
table('SupportTickets','SupportTicket',fields('TicketDto',{'expectedRevision','reason','placeId','messages','responses','images','attachments','message'}));fk('SupportTickets','RequesterId','AspNetUsers',nav='Requester',inverse='SupportTickets');fk('SupportTickets','OrganizationId','Organizations',nav='Organization');fk('SupportTickets','BranchId','Branches',nav='Branch');fk('SupportTickets','AssignedTo','AspNetUsers',nav='Assignee');ix('SupportTickets','RequesterId,Status');ck('SupportTickets',"[Kind] IN (N'support',N'accessibility-report',N'place-suggestion')");ck('SupportTickets',"[Status] IN (N'Open',N'In Progress',N'Resolved',N'Closed')")
table('TicketMessages','TicketMessage',[col('TicketId',required=True),col('ActorId'),col('Message','nvarchar(4000)',True),col('ActorName','nvarchar(120)'),col('ActorRole','nvarchar(20)')]);fk('TicketMessages','TicketId','SupportTickets',nav='Ticket',inverse='Messages');fk('TicketMessages','ActorId','AspNetUsers',nav='Actor');ix('TicketMessages','TicketId,CreatedAt')
table('TicketAttachments','TicketAttachment',[col('TicketId',required=True),col('DocumentId',required=True)]);fk('TicketAttachments','TicketId','SupportTickets',nav='Ticket',inverse='Attachments');fk('TicketAttachments','DocumentId','Documents',nav='Document');ix('TicketAttachments','TicketId,DocumentId',True)
table('Plans','Plan',fields('PlanDto',{'id'}));ix('Plans','Name',True);ck('Plans','[MonthlyPrice] >= 0 AND [AnnualDiscount] BETWEEN 0 AND 1 AND [BranchLimit] > 0')
table('Subscriptions','Subscription',fields('SubscriptionDto',{'expectedRevision','reason','plan','amount'}));fk('Subscriptions','OrganizationId','Organizations',nav='Organization',inverse='Subscriptions');fk('Subscriptions','PlanId','Plans',nav='Plan');ix('Subscriptions','OrganizationId',True,"[Status] = N'Active' AND [IsDeleted] = 0");ck('Subscriptions',"[Status] IN (N'Active',N'Inactive',N'Cancelled',N'Expired',N'Pending')");ck('Subscriptions',"[BillingCycle] IN (N'monthly',N'annual')");ck('Subscriptions','[Price] >= 0 AND [BranchLimit] > 0')
table('PaymentOperations','PaymentOperation',[col('OrganizationId',required=True),col('SubscriptionId'),col('Provider','nvarchar(40)',True),col('ProviderReference','nvarchar(200)'),col('OperationKind','nvarchar(30)',True),col('Status','nvarchar(30)',True),col('Amount','decimal(18,2)'),col('Currency','nvarchar(3)',True,"N'JOD'"),col('ProviderPayloadJson','nvarchar(max)')]);fk('PaymentOperations','OrganizationId','Organizations',nav='Organization');fk('PaymentOperations','SubscriptionId','Subscriptions',nav='Subscription');ix('PaymentOperations','Provider,ProviderReference',True,'[ProviderReference] IS NOT NULL');ck('PaymentOperations','[Amount] IS NULL OR [Amount] >= 0')
table('HoursChangeRequests','HoursChangeRequest',fields('HoursChangeRequestDto',{'resourceId','resourceKind','affectedBookingIds','organizationId','requestedBy','reviewedBy'})+[col('OrganizationId',required=True),col('BranchId'),col('RequestedById',required=True),col('ReviewedById')]);fk('HoursChangeRequests','OrganizationId','Organizations',nav='Organization',inverse='HoursRequests');fk('HoursChangeRequests',['BranchId','OrganizationId'],'Branches',['Id','OrganizationId'],nav='Branch');fk('HoursChangeRequests','RequestedById','AspNetUsers',nav='RequestedBy');fk('HoursChangeRequests','ReviewedById','AspNetUsers',nav='ReviewedBy');ix('HoursChangeRequests','OrganizationId,BranchId,Status');ix('HoursChangeRequests','BranchId',True,"[BranchId] IS NOT NULL AND [Status] = N'pending' AND [IsDeleted] = 0");ix('HoursChangeRequests','OrganizationId',True,"[BranchId] IS NULL AND [Status] = N'pending' AND [IsDeleted] = 0");ck('HoursChangeRequests',"[Status] IN (N'pending',N'approved',N'rejected',N'superseded')")
table('HoursAffectedBookings','HoursAffectedBooking',[col('HoursChangeRequestId',required=True),col('BookingId',required=True)]);fk('HoursAffectedBookings','HoursChangeRequestId','HoursChangeRequests',nav='Request',inverse='AffectedBookings');fk('HoursAffectedBookings','BookingId','Bookings',nav='Booking');ix('HoursAffectedBookings','HoursChangeRequestId,BookingId',True)
table('Notifications','Notification',fields('NotificationDto',{'readBy','read','expectedRevision'}));fk('Notifications','OwnerId','AspNetUsers',nav='Owner',inverse='Notifications');fk('Notifications','BookingId','Bookings',nav='Booking');fk('Notifications','HoursChangeRequestId','HoursChangeRequests',nav='HoursRequest');ix('Notifications','OwnerId,Status,CreatedAt');ck('Notifications',"[Status] IN (N'unread',N'read')")
table('NotificationReads','NotificationRead',[col('NotificationId',required=True),col('AccountId',required=True),col('ReadAt','datetimeoffset(7)',True,'SYSUTCDATETIME()')]);fk('NotificationReads','NotificationId','Notifications',nav='Notification',inverse='Readers');fk('NotificationReads','AccountId','AspNetUsers',nav='Account');ix('NotificationReads','NotificationId,AccountId',True)
table('SavedPlaces','SavedPlace',[col('AccountId',required=True),col('BranchId',required=True)]);fk('SavedPlaces','AccountId','AspNetUsers',nav='Account',inverse='SavedPlaces');fk('SavedPlaces','BranchId','Branches',nav='Branch');ix('SavedPlaces','AccountId,BranchId',True)
table('DeviceSessions','DeviceSession',[col('AccountId',required=True),col('SessionHash','binary(32)',True),col('Device','nvarchar(300)'),col('LastActive','datetimeoffset(7)',True),col('ExpiresAt','datetimeoffset(7)',True),col('RevokedAt','datetimeoffset(7)'),col('SecurityStampSnapshot','nvarchar(256)',True)]);fk('DeviceSessions','AccountId','AspNetUsers',nav='Account',inverse='Sessions');ix('DeviceSessions','SessionHash',True);ix('DeviceSessions','AccountId,RevokedAt')
table('AccessChallenges','AccessChallenge',[col('AccountId',required=True),col('Purpose','nvarchar(30)',True),col('TokenHash','binary(32)',True),col('ExpiresAt','datetimeoffset(7)',True),col('ConsumedAt','datetimeoffset(7)'),col('AttemptCount','int',True,'0')]);fk('AccessChallenges','AccountId','AspNetUsers',nav='Account');ix('AccessChallenges','TokenHash',True);ck('AccessChallenges','[AttemptCount] >= 0')
table('ImpersonationSessions','ImpersonationSession',[col('AdminId',required=True),col('TargetAccountId',required=True),col('Reason','nvarchar(1000)',True),col('ExpiresAt','datetimeoffset(7)',True),col('EndedAt','datetimeoffset(7)')]);fk('ImpersonationSessions','AdminId','AspNetUsers',nav='Admin');fk('ImpersonationSessions','TargetAccountId','AspNetUsers',nav='TargetAccount');ck('ImpersonationSessions','[AdminId] <> [TargetAccountId]')
table('AuditEvents','AuditEvent',fields('AuditDto',{'actorId'})+[col('ActorId')]);fk('AuditEvents','ActorId','AspNetUsers',nav='ActorAccount');ix('AuditEvents','EntityType,EntityId,Timestamp');ix('AuditEvents','ActorId,Timestamp')
table('FrontendStates','FrontendState',[col('Scope','nvarchar(20)',True),col('OwnerKey','nvarchar(128)',True),col('AccountId'),col('Key','nvarchar(200)',True),col('ValueJson','nvarchar(max)',True)]);fk('FrontendStates','AccountId','AspNetUsers',nav='Account');ix('FrontendStates','Scope,OwnerKey,Key',True);ck('FrontendStates',"([Scope] = N'global' AND [OwnerKey] = N'global' AND [AccountId] IS NULL) OR ([Scope] = N'account' AND [AccountId] IS NOT NULL AND [OwnerKey] = [AccountId])")
table('OutboxMessages','OutboxMessage',[col('OwnerId'),col('Kind','nvarchar(50)',True),col('PayloadJson','nvarchar(max)',True),col('Status','nvarchar(30)',True,"N'queued'"),col('AttemptCount','int',True,'0'),col('NextAttemptAt','datetimeoffset(7)'),col('SentAt','datetimeoffset(7)'),col('LastError','nvarchar(1000)')]);fk('OutboxMessages','OwnerId','AspNetUsers',nav='Owner');ix('OutboxMessages','Status,NextAttemptAt')
table('IdempotencyRecords','IdempotencyRecord',[col('AccountId',required=True),col('Operation','nvarchar(80)',True),col('Key','nvarchar(128)',True),col('RequestHash','binary(32)',True),col('ResponseJson','nvarchar(max)'),col('HttpStatus','int'),col('ExpiresAt','datetimeoffset(7)',True)]);fk('IdempotencyRecords','AccountId','AspNetUsers',nav='Account');ix('IdempotencyRecords','AccountId,Operation,Key',True)
table('RuntimeErrors','RuntimeError',fields('RuntimeErrorDto')+[col('AccountId')]);fk('RuntimeErrors','AccountId','AspNetUsers',nav='Account');ix('RuntimeErrors','CreatedAt')
table('ExternalJobs','ExternalJob',[col('AccountId',required=True),col('BranchId'),col('BookingId'),col('Kind','nvarchar(50)',True),col('Provider','nvarchar(50)'),col('Status','nvarchar(30)',True),col('RequestJson','nvarchar(max)'),col('ResultJson','nvarchar(max)'),col('FailureMessage','nvarchar(1000)'),col('CompletedAt','datetimeoffset(7)')]);fk('ExternalJobs','AccountId','AspNetUsers',nav='Account');fk('ExternalJobs','BranchId','Branches',nav='Branch');fk('ExternalJobs','BookingId','Bookings',nav='Booking');ix('ExternalJobs','AccountId,Kind,CreatedAt')
table('SyncRevisions','SyncRevision',[col('Id','int',True),col('Version','bigint',True,'0'),col('UpdatedAt','datetimeoffset(7)',True,'SYSUTCDATETIME()')],False)
table('TicketMessageAttachments','TicketMessageAttachment',[col('MessageId',required=True),col('DocumentId',required=True)]);fk('TicketMessageAttachments','MessageId','TicketMessages',nav='Message',inverse='Attachments');fk('TicketMessageAttachments','DocumentId','Documents',nav='Document');ix('TicketMessageAttachments','MessageId,DocumentId',True)
ak('BranchAnalyses',['Id','BranchId']);fk('Branches',['CurrentAnalysisId','Id'],'BranchAnalyses',['Id','BranchId'],nav='CurrentAnalysis')
# Essential fields cannot become nullable merely because a response DTO is permissive.
required={'AspNetUsers':['Email','NormalizedEmail','UserName','NormalizedUserName'],'Branches':['Name','Status','HoursRevision'],'Reviews':['Rating','Status'],'SupportTickets':['RequesterId','Kind','Status','Priority'],'Documents':['OwnerId','Name','FileName','Type','Size','Status'],'Notifications':['OwnerId','Kind','Title','Message','Status'],'Subscriptions':['OrganizationId','PlanId','BillingCycle','Status','BranchLimit','Price','Currency'],'Plans':['Name','MonthlyPrice','AnnualDiscount','BranchLimit','Currency','Active'],'HoursChangeRequests':['Status','BeforeJson','ProposedJson','BaseHoursRevision']}
for tn,required_columns in required.items():
 for c in tables[tn]['columns']:
  if c['name'] in required_columns:c['required']=True
ck('AppointmentProposals','[DurationMinutes] BETWEEN 15 AND 120')
ck('SupportTickets',"[Priority] IN (N'Low',N'Medium',N'High',N'Urgent')")
ck('Documents','[Size] >= 0')
ck('Documents',"[Status] IN (N'uploaded',N'preview-only',N'approved',N'rejected')")
ck('Branches','[AccessibilityScore] IS NULL OR [AccessibilityScore] BETWEEN 0 AND 100')
# Exact numeric types; coordinate columns must be paired, all JSON must be valid.
for name,t in tables.items():
 for c in t['columns']:
  if c['name'] in ('Latitude','Longitude'):c['type']='decimal(10,7)'
  if c['name'] in ('Price','MonthlyPrice','Amount'):c['type']='decimal(18,2)'
  if c['name'].endswith('Json'):ck(name,f"[{c['name']}] IS NULL OR ISJSON([{c['name']}]) = 1")
 if any(c['name']=='Latitude' for c in t['columns']):ck(name,'([Latitude] IS NULL AND [Longitude] IS NULL) OR ([Latitude] IS NOT NULL AND [Longitude] IS NOT NULL AND [Latitude] BETWEEN -90 AND 90 AND [Longitude] BETWEEN -180 AND 180)')
 if any(c['name']=='Revision' for c in t['columns']):ck(name,'[Revision] >= 0')
 # Ensure all foreign-key access paths have an index (unless already leading an existing index/key).
 for f in t['foreignKeys']:
  if not any((i['columns'][:len(f['columns'])]==f['columns']) for i in t['indexes']) and t['key'][:len(f['columns'])]!=f['columns']:ix(name,f['columns'])
# Opaque identifiers use exact case-sensitive comparison; never normalize/truncate IDs.
for tn,t in tables.items():
 for c in t['columns']:
  if c['name'] in t['key'] and c['type'].startswith('nvarchar'):c['collation']='Latin1_General_100_BIN2'
for t in tables.values():
 for f in t['foreignKeys']:
  for child,parent in zip(f['columns'],f['parentColumns']):
   pc=next(c for c in tables[f['parent']]['columns'] if c['name']==parent)
   if pc.get('collation'):next(c for c in t['columns'] if c['name']==child)['collation']=pc['collation']
# validation before emitting
for name,t in tables.items():
 names=[c['name'] for c in t['columns']];assert len(names)==len(set(names)),(name,names)
 for f in t['foreignKeys']:
  assert all(c in names for c in f['columns']),(name,f)
  parent=tables[f['parent']];assert all(c in [x['name'] for x in parent['columns']] for c in f['parentColumns'])
  assert f['parentColumns']==parent['key'] or f['parentColumns'] in parent['alternateKeys'],(name,f)
# SQL
sql=["-- Fresh database install. No DROP, no sample accounts, no passwords. SQL Server 2019+.","USE [master];\nGO\nIF DB_ID(N'WusoolDb') IS NULL EXEC(N'CREATE DATABASE [WusoolDb] COLLATE Latin1_General_100_CI_AS_SC');\nGO\nUSE [WusoolDb];\nGO\nSET XACT_ABORT ON;\nIF OBJECT_ID(N'dbo.AspNetUsers',N'U') IS NOT NULL THROW 51000, 'Schema already exists. Use reviewed migrations, not this installer.', 1;\nGO\nBEGIN TRANSACTION;"]
for name,t in tables.items():
 lines=[]
 for c in t['columns']:
  v=f"[{c['name']}] {c['type']}"+(' COLLATE '+c['collation'] if c.get('collation') else '')+(' NOT NULL' if c['required'] else ' NULL')
  if c['default'] is not None:v+=f" CONSTRAINT [DF_{name}_{c['name']}] DEFAULT ({c['default']})"
  lines.append(v)
 lines.append(f"CONSTRAINT [PK_{name}] PRIMARY KEY ("+', '.join('['+k+']' for k in t['key'])+')')
 for i,cs in enumerate(t['alternateKeys']):lines.append(f"CONSTRAINT [AK_{name}_{i}] UNIQUE ("+', '.join('['+k+']' for k in cs)+')')
 for i,c in enumerate(t['checks']):lines.append(f"CONSTRAINT [CK_{name}_{i}] CHECK ({c})")
 sql.append(f"CREATE TABLE [dbo].[{name}] (\n    "+',\n    '.join(lines)+'\n);')
for name,t in tables.items():
 for i,f in enumerate(t['foreignKeys']):sql.append(f"ALTER TABLE [dbo].[{name}] ADD CONSTRAINT [FK_{name}_{i}] FOREIGN KEY ("+', '.join('['+c+']' for c in f['columns'])+f") REFERENCES [dbo].[{f['parent']}] ("+', '.join('['+c+']' for c in f['parentColumns'])+") ON DELETE NO ACTION;")
 for i,x in enumerate(t['indexes']):sql.append(f"CREATE {'UNIQUE ' if x['unique'] else ''}INDEX [IX_{name}_{i}] ON [dbo].[{name}] ("+', '.join('['+c+']' for c in x['columns'])+')'+(' WHERE '+x['filter'] if x['filter'] else '')+';')
sql+=['INSERT INTO dbo.SyncRevisions (Id,Version) VALUES (1,0);','COMMIT TRANSACTION;\nGO']
(ROOT/'sql/01_Create_WusoolDb.sql').write_text('\n\n'.join(sql))
(ROOT/'docs/schema.json').write_text(json.dumps(tables,indent=2))
(ROOT/'docs/contract-field-starting-map.json').write_text(json.dumps(maps,indent=2))
# C# entities and navigation properties from same relational manifest.
def typ(c):
 t=c['type'];n=not c['required']
 if t.startswith('nvarchar'):return 'string' if not n else 'string?'
 b='bool' if t=='bit' else 'int' if t.startswith('int') else 'long' if t=='bigint' else 'byte' if t=='tinyint' else 'decimal' if t.startswith('decimal') else 'DateTimeOffset' if t.startswith('datetimeoffset') else 'DateOnly' if t=='date' else 'TimeOnly' if t.startswith('time(') else 'byte[]'
 return b+('?' if n else '')
identitynames={c['name'] for c in identity}|{'Id'}
navs={n:[] for n in tables}
for n,t in tables.items():
 for f in t['foreignKeys']:
  if n.startswith('AspNet') and n!='AspNetUsers':continue
  nullable=any(not next(c for c in t['columns'] if c['name']==x)['required'] for x in f['columns'])
  navs[n].append(f"public {tables[f['parent']]['entity']}{'?' if nullable else ''} {f['nav']} {{ get; set; }}"+('' if nullable else ' = null!;'))
  if f['inverse']:navs[f['parent']].append(f"public {t['entity']}? {f['inverse']} {{ get; set; }}" if f['one'] else f"public ICollection<{t['entity']}> {f['inverse']} {{ get; set; }} = new List<{t['entity']}>();")
for n,t in tables.items():
 if n.startswith('AspNet') and n!='AspNetUsers':continue
 lines=['using Microsoft.AspNetCore.Identity;','namespace Wusool.Data.Entities;','',f"public partial class {t['entity']}"+(' : IdentityUser' if n=='AspNetUsers' else ''),' {']
 for c in t['columns']:
  if n=='AspNetUsers' and c['name'] in identitynames:continue
  tp=typ(c);init=''
  if c['default'] and c['default'].startswith("N'"):init=' = '+json.dumps(c['default'][2:-1])+';'
  elif c['type']=='bit' and c['default']=='1':init=' = true;'
  elif c['type'] in ('int','bigint','tinyint') and c['default'] and c['default'].isdigit():init=' = '+c['default']+';'
  elif tp=='string':init=' = string.Empty;'
  elif tp=='byte[]':init=' = Array.Empty<byte>();'
  elif c['name'] in ('CreatedAt','UpdatedAt'):init=' = DateTimeOffset.UtcNow;'
  lines.append(f"    public {tp} {c['name']} {{ get; set; }}{init}")
 lines+=['    '+v for v in navs[n]];lines+=['}'];(ROOT/f"src/Wusool.Data/Entities/{t['entity']}.cs").write_text('\n'.join(lines)+'\n')
ctx=['using Microsoft.AspNetCore.Identity;','using Microsoft.AspNetCore.Identity.EntityFrameworkCore;','using Microsoft.EntityFrameworkCore;','using Wusool.Data.Entities;','namespace Wusool.Data;','', 'public sealed partial class WusoolDbContext(DbContextOptions<WusoolDbContext> options) : IdentityDbContext<ApplicationUser>(options)','{']
for n,t in tables.items():
 if not n.startswith('AspNet'):ctx.append(f"    public DbSet<{t['entity']}> {n} => Set<{t['entity']}>();")
ctx+=['    protected override void OnModelCreating(ModelBuilder b)','    {','        base.OnModelCreating(b);']
for n,t in tables.items():
 entity=t['entity'];v='e';ctx.append(f'        b.Entity<{entity}>(e =>\n        {{');ctx.append(f'            e.ToTable("{n}", "dbo", t =>\n            {{')
 for i,c in enumerate(t['checks']):ctx.append(f'                t.HasCheckConstraint("CK_{n}_{i}", {json.dumps(c)});')
 ctx+=['            });'];ctx.append('            e.HasKey(x => new { '+', '.join('x.'+k for k in t['key'])+' });')
 for i,cs in enumerate(t['alternateKeys']):ctx.append('            e.HasAlternateKey(x => new { '+', '.join('x.'+k for k in cs)+f' }}).HasName("AK_{n}_{i}");')
 for c in t['columns']:
  exp=f"            e.Property(x => x.{c['name']})";ct=c['type']
  if ct=='rowversion':exp+='.IsRowVersion()'
  elif 'IDENTITY' in ct:exp+='.UseIdentityColumn()'
  else:
   exp+=f'.HasColumnType("{ct}")'
   if ct.startswith('nvarchar(') and ct!='nvarchar(max)':exp+=f'.HasMaxLength({ct[9:-1]})'
   if ct=='int' and c['name']=='Id':exp+='.ValueGeneratedNever()'
   if c.get('collation'):exp+=f'.UseCollation("{c["collation"]}")'
   if c['required']:exp+='.IsRequired()'
   if c['default'] is not None:
    dv=c['default']
    if ct=='bit':exp+=f'.HasDefaultValue({"true" if dv=="1" else "false"})'
    elif dv.startswith("N'"):exp+=f'.HasDefaultValue({json.dumps(dv[2:-1])})'
    elif ct in ('int','bigint','tinyint'):exp+=f'.HasDefaultValue({dv})'
    else:exp+=f'.HasDefaultValueSql({json.dumps(dv)})'
   if c['name']=='Revision':exp+='.IsConcurrencyToken()'
  ctx.append(exp+';')
 for i,x in enumerate(t['indexes']):
  exp='            e.HasIndex(x => new { '+', '.join('x.'+k for k in x['columns'])+' })'+f'.HasDatabaseName("IX_{n}_{i}")'
  if x['unique']:exp+='.IsUnique()'
  if x['filter']:exp+=f'.HasFilter({json.dumps(x["filter"])})'
  ctx.append(exp+';')
 for i,f in enumerate(t['foreignKeys']):
  nav=f['nav'] if not(n.startswith('AspNet') and n!='AspNetUsers') else None
  exp=f'            e.HasOne(x => x.{nav})' if nav else f"            e.HasOne<{tables[f['parent']]['entity']}>()"
  if f['one']:exp+=f'.WithOne(x => x.{f["inverse"]})'+f'.HasForeignKey<{entity}>(x => new {{ '+', '.join('x.'+k for k in f['columns'])+' })'
  else:exp+=('.WithMany(x => x.'+f['inverse']+')' if f['inverse'] else '.WithMany()')+'.HasForeignKey(x => new { '+', '.join('x.'+k for k in f['columns'])+' })'
  if f['parentColumns']!=tables[f['parent']]['key']:exp+='.HasPrincipalKey(x => new { '+', '.join('x.'+k for k in f['parentColumns'])+' })'
  ctx.append(exp+f'.HasConstraintName("FK_{n}_{i}").OnDelete(DeleteBehavior.NoAction);')
 ctx+=['        });']
ctx+=['    }','}'];(ROOT/'src/Wusool.Data/WusoolDbContext.cs').write_text('\n'.join(ctx)+'\n')
print('Generated',len(tables),'tables;',sum(len(t['foreignKeys']) for t in tables.values()),'foreign keys')
