# user-requirement.pdf

## Page 1

Xentara  Xentara  Framework   
A  Programmable  Community  Intelligence  Layer  provided  as  a  platform  template  to  
Community
 
Custodians
 
Requirements  Speciﬁcation  
1.   Identiﬁcation  
Project  Name:  Xentara  Xentara  Framework  Product  Class:  Agentic  Content-Aggregation  Framework  (ACAF)  Runtime:  Hybrid  (Web  +  Telegram  Native)  
2.  Executive  Technical  Summary  for  Stakeholders  
The  Xentara  Xentara  Framework  is  a  multi-tenant,  enterprise-grade  SaaS  platform  designed  to  
transition
 
online
 
communities
 
from
 
chaotic
 
social
 
media
 
feeds
 
into
 
highly
 
curated,
 
AI-driven
 
"Intelligence
 
Hubs."
 
It
 
eliminates
 
the
 
need
 
for
 
manual
 
community
 
management
 
and
 
custom
 
app
 
development
 
by
 
utilizing
 
a
 
sophisticated,
 
autonomous
 
architecture
 
broken
 
into
 
four
 
core
 
pillars:
 
1.  The  7-Agent  Intelligence  Pipeline   
Unlike  standard  RSS  readers,  Xentara  Xentara  employs  a  continuous  loop  of  specialized  
AI
 
agents.
 
The
 
Xentara
 
Layer
 
autonomously
 
ingests,
 
transcribes
 
(via
 
Whisper),
 
and
 
translates
 
raw
 
multi-modal
 
media
 
(video,
 
audio,
 
text).
 
The
 
Xentara
 
Layer
 
then
 
reformats
 
this
 
data
 
into
 
clean
 
Markdown
 
summaries
 
while
 
predicting
 
sentiment
 
and
 
tracking
 
the
 
political
 
leaning/objectivity
 
of
 
the
 
source
 
publishers.
 
2.  Polymorphic  Board  Architecture   

## Page 2

Hubs  are  not  restricted  to  basic  vertical  newsfeeds.  Community  Custodians  can  
conﬁgure
 
up
 
to
 
10
 
distinct
 
boards
 
utilizing
 
modular
 
Archetypes—seamlessly
 
transitioning
 
the
 
UI
 
from
 
standard
 
news
 
streams
 
to
 
interactive
 
event
 
calendars,
 
static
 
entity
 
registries,
 
or
 
transactional
 
community
 
marketplaces.
 
3.  Dual-Runtime  Delivery  (Web  &  Telegram)   
To  eliminate  onboarding  friction,  the  framework  utilizes  a  hybrid  delivery  model.  
Casual
 
users
 
interact
 
with
 
a
 
beautifully
 
responsive,
 
SEO-optimized
 
web
 
application
 
(Tier
 
1).
 
However,
 
premium
 
subscribers
 
unlock
 
the
 
Tier
 
2
 
Runtime:
 
a
 
native
 
Telegram
 
Mini
 
App
.
 
This
 
provides
 
the
 
Hub
 
with
 
100%
 
reliable
 
push-notiﬁcation
 
reach,
 
bypassing
 
algorithmic
 
suppression
 
from
 
big
 
tech
 
platforms.
 
4.  Decentralized  Curation  &  Monetization   
The  platform  transforms  passive  readers  into  an  active  collective  intelligence.  Users  
dynamically
 
train
 
their
 
own
 
personalized
 
"For
 
You"
 
algorithms,
 
directly
 
rate
 
the
 
credibility
 
of
 
media
 
establishments,
 
and
 
submit
 
content
 
via
 
a
 
dedicated
 
messaging
 
inbox.
 
Furthermore,
 
Custodians
 
can
 
seamlessly
 
monetize
 
this
 
high-trust
 
environment
 
via
 
a
 
native
 
Ad
 
Console
 
and
 
premium
 
membership
 
gating.
 
The  SaaS  Deployment  Model  &  Collective  Intelligence  Loop  As  a  white-label,  multi-tenant  
SaaS
 
solution,
 
the
 
framework
 
operates
 
on
 
a
 
single,
 
massively
 
scalable
 
infrastructure.
 
When
 
a
 
Community
 
Custodian
 
registers,
 
they
 
are
 
instantly
 
provisioned
 
a
 
secure,
 
logical
 
"Workspace"
 
(referred
 
to
 
as
 
a
 
Hub)
 
that
 
maps
 
directly
 
to
 
their
 
own
 
custom
 
domain.
 
Ultimately ,  this  deployment  model  elevates  the  Hub  from  a  simple  news  aggregator  into  a  
Collective
 
Intelligence
 
Engine
.
 
By
 
combining
 
Agentic
 
Ingestion
 
with
 
community
 
peer-review,
 
the
 
platform
 
creates
 
a
 
mission-led
 
ﬁlter
 
for
 
niche
 
audiences
 
driven
 
by
 
a
 
continuous,
 
self-optimizing
 
feedback
 
loop:
 
●  The  Intelligence  Loop:  Raw  Internet  Data  →  AI  Agents  (Ingest/Summarize)  
→
 
Polymorphic
 
Boards
 
→
 
Users
 
(Consume/Rate)
 
→
 
AI
 
Agents
 
(Refine
 
&
 
Predict)
 
This  loop  guarantees  that  the  longer  a  Hub  operates,  the  smarter,  more  objective,  and  more  
personalized
 
its
 
curation
 
becomes.
 

## Page 3

3.  High-Level  Architecture:  The  "Four-Layer"  Logic  
3.1   Terminology  
Monitored  Sources :  the  Monitored  Sources  list  is  a  curated  list  of  content  producers  -  
e.g.,
 
media
 
establishments
 
like
 
YouTube,
 
Rumble
 
and
 
Vimeo
  
channels,
 
blogs,
 
websites,
 
social
 
media
 
pages,
 
etc.
 
-
 
that
 
are
 
considered
 
to
 
be
 
producers
 
of
 
content
 
that
 
is
 
deemed
 
to
 
be
 
relevant
 
for
 
the
 
particular
 
Hub
 
that
 
draws
 
content
 
from
 
them.
 
Can
 
also
 
be
 
thought
 
of
 
as
 
Publishers
 
or
 
(Content)
 
Feeders.
 
Hubs :  a  Hub  is  an  isolated,  bespoke  instance  of  the  Xentara  Xentara  framework  deployed  
for
 
a
 
speciﬁc
 
community
 
custodian.
 
Boards :  The  primary  “pages”  conﬁgured  for   a  Hub  (up  to  10  per  Hub)that  each  present  
a
 
certain
 
type
 
of
 
content,
 
including
 
the
 
Feed
 
Filter
 
and
 
tools
 
utilized
 
by
 
the
 
board.
 
Board  Type  (Archetypes):  The  structural  classiﬁcation  assigned  to  a  board  that  strictly  
governs
 
its
 
UI
 
layout
 
(e.g.,
 
a
 
vertical
 
feed,
 
a
 
chronological
 
calendar,
 
or
 
a
 
static
 
registry
 
grid),
 
the
 
speciﬁc
 
Card
 
Types
 
it
 
supports,
 
its
 
available
 
Action
 
Bar
 
tools,
 
and
 
its
 
underlying
 
data
 
ingestion
 
logic
 
(external
 
monitored
 
sources
 
vs.
 
internal
 
system
 
data).
 
Embedded  Boards :  Sub-boards  that  exist  entirely  within  the  context  of  a  parent  Card  
(e.g.,
 
a
 
comment
 
stream),
 
inaccessible
 
from
 
global
 
navigation.
 
Cards :  The  standardized  UI  container  for  Monitored  Sources  Publications  (MMPs),  
existing
 
in
 
Contracted
 
or
 
Expanded
 
states.
 
Card  Types :  The  platform  template  provides  four  foundational  Card  Types  based  on  
their
 
data
 
schema
 
and
 
presentation
 
layout,
 
viz.,
 
Narrative
 
Cards,
 
Chronological
 
Cards,
 
Entity
 
Cards,
 
and
 
Transactional
 
Cards.
 
Board  Content  Display :  The  primary  viewing  area  (typically  the  center  column)  in  the  UI  
that
 
presents
 
the
 
board's
 
populated
 
content.
 
By
 
default,
 
it
 
functions
 
as
 
an
 
inﬁnite-scroll
 
feed
 
of
 
minimal,
 
contracted
 
Tiles
 
(displaying
 
only
 
essential
 
metadata
 
such
 
as
 
a
 
title,
 
byline,
 
publisher,
 
category
 
tag,
 
timestamp,
 
and
 
a
 
thumbnail
 
or
 
featured
 
hero
 
image).
 
These
 
tiles
 
serve
 
as
 
interactive
 
gateways
 
that,
 
upon
 
user
 
selection,
 
expand
 
inline
 
into
 
fully
 
detailed
 
Expanded
 
Cards
 
to
 
reveal
 
the
 
AI-generated
 
summaries
 
and
 
the
 
Action
 
Bar..
 

## Page 4

Taste  Graph :  A  continuously  updated  vector  representation  of  a  user’s  or  community’s  
preferences,
 
driven
 
by
 
their
 
ratings
 
and
 
interactions,
 
used
 
to
 
algorithmically
 
rank
 
and
 
recommend
 
cards).
 Feed  Filter :  The  left-hand  navigation  column  that  allows  users  to  dynamically  ﬁlter  a  
board's
 
content
 
by
 
speciﬁc
 
Publishers
 
or
 
source
 
tags.
  3.2  Platform  Business  Model  To  sell  this  as  a  “ template ”,  we  deﬁne  it  by  its  four  functional  layers:  (note:  while  the  framework  uses  "Boards"  internally,  these  can  be  presented  to  users  as  
"Channels"
 
in
 
the
 
UI)
 
 Layer  Component  Function  
 Management  The  Admin  Console  (Control  Plane)  
The  "Command  Center"  for  the  custodian.  Used  to  conﬁgure  boards,  whitelist  sources,  "tune"  agent  personas,  and  manage  paid  placements.  Includes  the  "Monitored  Sources  List"  -  a  curated  registry  of  approved  publishers  with  "Publisher  Proﬁling  Management"  and  "User  Taxonomy  Control"  (Casual  vs.  Registered  vs.  Admin);  also  manage  monetized  placements  via  the  Marketplace  &  Ad  Console .  
 Ingestion  Xentara  Agentic  Artefacts  
7  specialized  agents  (Sourcing,  Transcriber,  Translator,  Creative,  Taste  Predictor,  Rating  Proﬁler,  Publisher  Proﬁler)  that  monitor,  transcribe,  process,  and  mapping  Taste  Vectors  ("pre-rank"  multi-modal  sources  such  as  YT,  RSS,  Social),  and  the   Publisher  Proﬁler  (responsible  for  the  Establishment  Scorecard).  
 Curation  The  Xentara  Board  Engine  A  multi-tenant  controller  managing  up  to  10  conﬁgurable  board  repositories.  It  utilizes  Routing  Rules  to  push  agent  outputs  into  speciﬁc  Board  Archetypes  (e.g.,  standard  feeds,  calendars,  registries)  and  manages  the  Establishment  Scorecards .  Handles  metadata,  "Contracted"  vs.  "Expanded"  card  states,  and  Paid  

## Page 5

Placement  injection.  Manages  "Publisher  Records"  and  the  "Action  Bar"  metadata  (claps,  ratings,  comments,  etc.).  
 Delivery  (Tier  1)  Standard  Runtime  (PWA)  
Standard  Browser  Hub :  A  browser-based  Progressive  Web  App  providing  cross-platform  access  to  "Boards."  Focuses  on  SEO,  guest  browsing,  and  conversion  hooks.  Some  agentic  utility  (Transcripts/Translations).  
 Delivery  (Tier  2)  Elite  Runtime  (Telegram  TMA)  
Premium  Intelligence  Layer :  Featuring  100%  reliable  push  alerts,  personalized  "For  You"  feeds,  and  advanced  API  tools  like  the  "Add  to  RAG"  export.   
3.3  SaaS  Multi-Tenancy  &  Infrastructure  Architecture  To  ensure  rapid  market  deployment  and  low  friction  for  Community  Custodians,  the  
Xentara
 
Xentara
 
Framework
 
operates
 
as
 
a
 
centralized,
 
managed
 
Software-as-a-Service
 
(SaaS).
 
All
 
Hubs
 
(instances)
 
share
 
the
 
same
 
underlying
 
core
 
application
 
and
 
agentic
 
pipeline
 
compute
 
resources,
 
necessitating
 
strict
 
protocols
 
for
 
data
 
privacy,
 
tenant
 
isolation,
 
and
 
white-label
 
branding.
 3.3.1    Multi-Tenant  Data  Isolation  (Logical  Separation)  The  framework  must  employ  a  robust  logical  isolation  architecture  to  guarantee  
that
 
data,
 
user
 
proﬁles,
 
and
 
agentic
 
intelligence
 
models
 
do
 
not
 
"bleed"
 
between
 
dierent
 
Hubs
 
(e.g.,
 
ensuring
 
Volkwolk
 
data
 
is
 
entirely
 
inaccessible
 
to
 
the
 
Carrier
 
Pigeon
 
Hub).
 ●  Database  Schema  &  Row-Level  Security  (RLS):  A  strict  single-database,  
multi-tenant
 
architecture
 
must
 
be
 
used.
 
Every
 
primary
 
entity
 
record
 
in
 
the
 
relational
 
database
 
(Cards,
 
Boards,
 
Publishers,
 
Users,
 
Comments)
 
must
 
be
 
tagged
 
with
 
a
 
unique
 
tenant_id
 
(Hub
 
ID).
 
The
 
database
 
must
 
enforce
 
Row-Level
 
Security
 
(RLS)
 
policies
 
to
 
ensure
 
that
 
queries
 
can
 
only
 
read,
 
write,
 
or
 
update
 
records
 
associated
 
with
 
the
 
authenticated
 
tenant_id.
 ●  Vector  Database  Namespace  Isolation:  The  agentic  pipeline  relies  on  vector  
databases
 
for
 
the
 
Taste
 
Predictor
 
and
 
Rating
 
Proﬁler
 
agents.
 
To
 
prevent
 
the
 
"Taste
 
Graph"
 
of
 
one
 
community
 
from
 
skewing
 
the
 
recommendations
 
of
 

## Page 6

another,  vector  embeddings  must  be  strictly  partitioned.  This  must  be  
achieved
 
either
 
by
 
using
 
dedicated
 
Namespaces
 
per
 
tenant_id
 
or
 
by
 
applying
 
hard
 
metadata
 
ﬁlters
 
on
 
all
 
vector
 
similarity
 
searches.
 
●  Agent  Persona  Isolation:  When  processing  content,  the  LLM-driven  agents  
(Creative
 
Agent,
 
Taste
 
Predictor)
 
must
 
dynamically
 
load
 
the
 
speciﬁc
 
"Seed
 
Documents"
 
and
 
"Keyword
 
Guardrails"
 
assigned
 
to
 
the
 
active
 
tenant_id.
 
3.3.2  Custom  Domain  Mapping  &  White-Label  Routing  To  fulﬁll  the  "white-label"  value  proposition,  the  framework  must  allow  Community  
Custodians
 
to
 
present
 
their
 
Hub
 
under
 
their
 
own
 
branded
 
domain
 
(e.g.,
 
www.volkwolk.com)
 
without
 
exposing
 
the
 
underlying
 
Xentara
 
Xentara
 
platform
 
URLs.
 
●  Edge  Routing  Resolution:  The  Delivery  Layer  must  utilize  edge  network  
routing
 
(e.g.,
 
Vercel
 
Edge
 
Network,
 
Cloudﬂare
 
for
 
SaaS,
 
or
 
a
 
custom
 
reverse
 
proxy).
 
When
 
a
 
user
 
visits
 
a
 
custom
 
domain,
 
the
 
edge
 
router
 
must
 
dynamically
 
inspect
 
the
 
incoming
 
hostname,
 
look
 
up
 
the
 
corresponding
 
tenant_id
 
in
 
the
 
management
 
database,
 
and
 
serve
 
the
 
correctly
 
branded
 
PWA
 
(Tier
 
1
 
Runtime)
 
and
 
board
 
conﬁgurations
 
for
 
that
 
speciﬁc
 
Hub.
 
●  Automated  SSL/TLS  Provisioning:  The  framework  must  automatically  
provision
 
and
 
renew
 
SSL
 
certiﬁcates
 
for
 
all
 
custodian-mapped
 
custom
 
domains
 
to
 
ensure
 
secure,
 
HTTPS-encrypted
 
access
 
without
 
requiring
 
manual
 
server
 
conﬁguration
 
by
 
the
 
custodian.
 
●  Bot  Identity  Masking  (Telegram  Tier  2 ):  For  the  Elite  Runtime,  the  tenant_id  
resolution
 
dictates
 
which
 
Telegram
 
Bot
 
Token
 
is
 
used.
 
While
 
the
 
backend
 
logic
 
is
 
processed
 
by
 
the
 
centralized
 
Xentara
 
Xentara
 
engine,
 
the
 
end-user
 
interacts
 
exclusively
 
with
 
a
 
custom-named
 
bot
 
(e.g.,
 
@Volkwolk_Bot)
 
managed
 
via
 
the
 
custodian's
 
own
 
Telegram
 
API
 
credentials,
 
maintaining
 
the
 
white-label
 
illusion.
 
3.4  The  Intelligence  Layer  (Agentic  Pipeline)  
The  Xentara  Xentara  framework  operates  on  a  continuous,  7-agent  feedback  loop.  These  
specialized
 
AI
 
subsystems
 
are
 
responsible
 
for
 
the
 
ingestion,
 
formaing,
 
and
 
algorithmic
 
scoring
 
of
 
all
 
Hub
 
content.
 

## Page 7

3.4.1    Ingestion  &  Processing  Agents  (The  "Xentara"  Layer)   This  subset  handles  the  initial  extraction  and  cleaning  of  noisy,  multi-modal  
internet
 
data.
 
●  The  Sourcing  Agent :  Monitors  the  whitelisted  "Monitored  Media  Registry"  
(e.g.,
 
X,
 
YouTube,
 
RSS
 
feeds).
 
It
 
acts
 
as
 
the
 
primary
 
ﬁlter,
 
discarding
 
irrelevant
 
noise
 
and
 
passing
 
viable
 
links
 
into
 
the
 
pipeline.
 
●  The  Transcriber  Agent :  Triggered  speciﬁcally  for  video  (YouTube)  or  audio  
(Podcast)
 
sources.
 
It
 
utilizes
 
Speech-to-Text
 
models
 
(e.g.,
 
Whisper)
 
to
 
generate
 
a
 
complete
 
text
 
transcript,
 
creating
 
a
 
readable
 
base
 
for
 
downstream
 
agents.
 
●  The  Translator  Agent :  A  dynamic  localization  agent.  If  the  ingested  source  is  
in
 
a
 
foreign
 
language,
 
this
 
agent
 
translates
 
the
 
raw
 
text
 
or
 
transcript
 
into
 
the
 
Hub’s
 
primary
 
default
 
language
 
prior
 
to
 
summarization.
 
3.4.2   Formaing  &  Predictive  Agents  (The  "Xentara"  Layer)   This  subset  generates  the  standardized  presentation  and  pre-calculates  
algorithmic
 
relevance.
 
●  The  Creative  Agent  (The  Editor) :  Takes  the  raw  or  translated  text  and  distills  
it
 
into
 
the
 
standardized
 
Card
 
schema.
 
It
 
generates
 
the
 
concise
 
headlines,
 
the
 
150-character
 
contracted
 
bylines,
 
and
 
the
 
full
 
Markdown-rendered
 
summaries
 
for
 
the
 
Expanded
 
state.
 
●  The  Taste  Predictor  Agent :  Performs  pre-emptive  sentiment  and  leaning  
analysis.
 
Before
 
a
 
newly
 
ingested
 
card
 
is
 
viewed
 
by
 
any
 
user,
 
this
 
agent
 
evaluates
 
the
 
text
 
and
 
assigns
 
baseline
 
"Taste
 
Vectors"
 
(e.g.,
 #HighlyTechnical,  #Neutral,  #Optimistic).  This  solves  the  "Cold  
Start"
 
problem,
 
allowing
 
the
 
system
 
to
 
recommend
 
new
 
content
 
instantly.
 
3.4.3  Community  &  Feedback  Agents  (The  Optimization  Layer)   This  subset  actively  learns  from  user  behavior  to  drive  the  platform's  
personalization
 
and
 
credibility
 
metrics.
 

## Page 8

●  The  Rating  Proﬁler  (Collaborative  Filtering  Agent) :  Powers  the  personalized  
"For
 
You"
 
boards.
 
It
 
maps
 
the
 
interaction
 
history
 
(claps,
 
saves,
 
"Show
 
Less
 
Like
 
This"
 
actions)
 
of
 
User
 
A
 
against
 
similar
 
clusters
 
of
 
users.
 
It
 
continually
 
adjusts
 
the
 
user's
 
personal
 
Taste
 
Graph
 
to
 
surface
 
highly
 
relevant
 
content.
 
●  The  Publisher  Proﬁler  Agent :  Governs  media  credibility.  This  agent  
aggregates
 
all
 
explicit
 
user
 
ratings
 
regarding
 
a
 
speciﬁc
 
source
 
over
 
time
 
(via
 
the
 
"Classify"
 
tool).
 
It
 
dynamically
 
calculates
 
and
 
updates
 
the
 
"Establishment
 
Scorecard"
 
for
 
each
 
publisher,
 
tracking
 
community
 
consensus
 
on
 
their
 
objectivity,
 
political
 
leaning,
 
and
 
historical
 
accuracy.
 
***  Developer  Note :  This  architecture  ensures  that  you  (the  platform  owner)  only  have  
to
 
maintain
 
and
 
deploy
 
one
 
codebase
 
and
 
one
 
instance
 
of
 
the
 
AI
 
Agent
 
pipeline,
 
drastically
 
reducing
 
overhead
 
while
 
still
 
providing
 
"bespoke"
 
environments
 
to
 
your
 
clients.
 
4.  Standard  Runtime  (PWA)  Intelligence  Hub  
This  tier  1  option  is  a  Progressive  Web  App  (PWA)  which  provides  the  standard  
browser-based
 
hub
 
for
 
Xentara
 
Xentara
 
Framework.
 
It
 
functions
 
as
 
the
 
accessible,
 
cross-platform
 
entry
 
point
 
for
 
all
 
users—especially
 
casual/guest
 
visitors,
 
new
 
users
 
during
 
onboarding,
 
and
 
anyone
 
preferring
 
a
 
full-screen
 
web
 
experience
 
without
 
relying
 
on
 
Telegram.
 
It  is  a  fully  responsive,  installable  web  application  that  users  access  by  visiting  the  
community's
 
branded
 
domain
 
(e.g.,
 
carrierpigeonhaven.com).
 
It
 
behaves
 
like
 
a
 
lightweight
 
native
 
app
 
once
 
installed,
 
providing
 
a
 
polished,
 
app-like
 
experience
 
directly
 
in
 
the
 
browser.
 
4.1  Core  Characteristics  &  Capabilities  
●  Installable  &  App-Like  Feel:  
Users  see  an  "Add  to  home  screen"  or  "Install"  prompt  (native  browser  behavior  
when
 
criteria
 
are
 
met:
 
HTTPS,
 
manifest,
 
service
 
worker).
 
Once
 
installed:
 
○  Standalone  window  mode  (no  browser  UI  chrome).  

## Page 9

○  Custom  app  icon,  name,  theme  colors,  and  splash  screen  matching  the  
community's
 
branding.
 
○  Launches  from  the  device's  home  screen/app  drawer  like  any  other  app.  
●  Responsive  &  Cross-Platform:  
Adapts  seamlessly  to  desktop,  tablet,  and  mobile  viewports.  Optimized  layouts  
include:
 
○  Grid  or  card-based  feed  on  larger  screens.  
○  Vertical  scrolling  list  on  phones  with  touch-friendly  elements.  
●  Oine  &  Reliable  Performance  Powered  by  service  workers :  
○  Caches  core  assets  (UI,  manifests,  common  card  thumbnails).  
○  Allows  viewing  previously  loaded  boards/cards  oine  (with  graceful  
degradation
 
for
 
fresh
 
content).
 
○  Background  sync  for  pending  ratings/promotions  when  connectivity  returns.  
●  SEO  &  Discoverability:  Server-side  rendering  or  static  generation  for  initial  pages  
ensures
 
search
 
engines
 
can
 
crawl
 
boards,
 
card
 
summaries,
 
and
 
metadata.
 
Public
 
boards
 
appear
 
in
 
Google
 
searches,
 
driving
 
organic
 
traic
 
to
 
the
 
community.
 
●  Guest  vs.  Authenticated  Access  
○  Casual/Guest  users :  Browse  public  boards  anonymously  with  read-only  view  
(no
 
ratings,
 
promotions,
 
or
 
personalized
 
ranking).
 
○  Registered  users  (via  Google  Sign-In) :  Full  interactivity,  including  personalized  
"For
 
You"
 
board
 
based
 
on
 
taste
 
proﬁle.
 
4.2   User  Interface  &  Layout  
The  web-based  user  interface  must  prioritize  clean  content  discovery,  utilizing  a  
structured
 
layout
 
focused
 
on
 
content
 
consumption
 
that
 
balances
 
global
 
navigation
 
with
 
deep,
 
contextual
 
exploration,
 
at
 
the
 
root
 
level
 
similar
 
in
 
style
 
to
 
the
 
Brave
 
News
 
interface.
 
The
 
layout
 
is
 
deﬁned
 
by
 
the
 
following
 
core
 
UI
 
components
 
and
 
behaviors:
 

## Page 10

4.2.1   Header  ●  Community  logo  and  name  
●  Global  Search  &  Discovery  Engine   
The  search  bar  positioned  in  the  Header  acts  as  the  primary  discovery  tool  for  
the
 
Hub,
 
extending
 
far
 
beyond
 
simple
 
title
 
matching.
 
It
 
must
 
support
 
the
 
following
 
capabilities:
 
○  Full -Text  Indexing:  The  search  engine  queries  the  complete  depth  of  the  
card's
 
data
 
schema.
 
This
 
includes
 
the
 
original
 
headline,
 
the
 
full
 
Markdown-rendered
 
summary
 
generated
 
by
 
the
 
Creative
 
Agent,
 
and
 
any
 
underlying
 
text
 
processed
 
by
 
the
 
Transcriber
 
or
 
Translator
 
Agents.
 
○  Faceted  &  Metadata  Search:  Users  must  be  able  to  search  using,  or  ﬁlter  
results
 
by,
 
the
 
Hub's
 
structured
 
metadata.
 
This
 
includes
 
searching
 
for
 
speciﬁc
 
Publisher
 
names,
 
system-assigned
 
classiﬁcations
 
(e.g.,
 #International),  or  agent-generated  sentiment  tags  (e.g.,  #HealthAlert).  
○  Contextual  Scope  (Global  vs.  Local):  By  default,  the  search  operates  
globally
 
across
 
all
 
boards
 
the
 
user
 
has
 
access
 
to.
 
However,
 
the
 
UI
 
must
 
provide
 
a
 
quick
 
toggle
 
or
 
dropdown
 
to
 
restrict
 
the
 
search
 
scope
 
to
 
the
 
currently
 
active
 
board
 
(e.g.,
 
searching
 
only
 
within
 
the
 
"Events"
 
calendar)
 
or
 
strictly
 
within
 
the
 
user's
 
personal
 
"Saved/Bookmarked"
 
list.
 
○  Intelligent  Result  Presentation:  Search  results  are  presented  in  a  
dedicated,
 
inﬁnite-scroll
 
overlay
 
or
 
a
 
temporary
 
"Search
 
Results"
 
board.
 
Results
 
are
 
dynamically
 
sorted
 
by
 
relevance
 
(keyword
 
density
 
and
 
date),
 
with
 
cards
 
previously
 
"Saved"
 
or
 
"Clapped"
 
by
 
the
 
user
 
receiving
 
a
 
slight
 
visual
 
highlight
 
or
 
ranking
 
boost
 
to
 
reﬂect
 
their
 
personal
 
Taste
 
Graph.
 
●  Manual  Refresh  Buon  (Soft-Sync  Trigger)   
A  dedicated  UI  control  (typically  a  circular  arrow  icon)  that  allows  the  user  to  
manually
 
poll
 
the
 
server
 
for
 
new
 
data
 
without
 
triggering
 
a
 
disruptive,
 
full-page
 
browser
 
reload.
 
Activating
 
this
 
buon
 
executes
 
the
 
following
 
state
 
updates:
 

## Page 11

○  New  Content  Injection:  It  queries  the  backend  for  any  newly  processed  
Monitored
 
Media
 
Publications
 
that
 
match
 
the
 
currently
 
active
 
board's
 
routing
 
rules
 
or
 
the
 
user's
 
Feed
 
Filter
 
seings.
 
New
 
contracted
 
tiles
 
are
 
seamlessly
 
prepended
 
to
 
the
 
top
 
of
 
the
 
inﬁnite-scroll
 
feed.
 
○  Metadata  &  Engagement  Sync:  It  refreshes  dynamic  engagement  metrics  
on
 
currently
 
visible
 
cards,
 
updating
 
live
 
counts
 
for
 
claps,
 
comments,
 
and
 
Publisher
 
Scorecard
 
adjustments
 
driven
 
by
 
recent
 
community
 
interactions.
 
○  Taste  Graph  Recalculation  (Contextual):  If  the  user  is  currently  viewing  
the
 
algorithmically
 
sorted
 
"For
 
You"
 
board,
 
triggering
 
the
 
refresh
 
forces
 
the
 
UI
 
to
 
fetch
 
a
 
newly
 
sorted
 
batch
 
of
 
cards,
 
instantly
 
reﬂecting
 
any
 
explicit
 
or
 
implicit
 
feedback
 
(e.g.,
 
"Show
 
Less
 
Like
 
This"
 
actions)
 
the
 
user
 
just
 
provided.
 
○  Scroll  Reset:  Activating  the  refresh  automatically  snaps  the  user's  
viewport
 
back
 
to
 
the
 
top
 
of
 
the
 
active
 
board
 
to
 
display
 
the
 
newly
 
fetched
 
content.
 
●  Authentication ,  Registration  &  Membership  Module   
The  Header  must  include  a  dynamic  user-state  cluster  that  handles  identity  
and
 
Hub-speciﬁc
 
monetization.
 
Its
 
presentation
 
adapts
 
based
 
on
 
the
 
user's
 
current
 
access
 
tier:
 
○  Unauthenticated  State  (Casual  Users) :  Displays  clear  "Sign  In"  and  "Join  /  
Subscribe"
 
actions.
 
■  The  Join  Flow:  Clicking  "Join"  must  trigger  a  uniﬁed  onboarding  modal  
or
 
dedicated
 
membership
 
page.
 
This
 
interface
 
dynamically
 
presents
 
the
 
speciﬁc
 
membership
 
options
 
conﬁgured
 
by
 
the
 
Hub
 
Administrator.
 
■  Dynamic  Pricing  &  Tiers:  The  framework  must  support  both  Free  
Registration
 
(Google
 
Auth
 
ﬂow
 
to
 
become
 
a
 
"Registered
 
User")
 
and
 
Paid
 
Subscriptions
 
(to
 
become
 
an
 
"Elite
 
User").
 
If
 
the
 
Admin
 
has
 
monetized
 
the
 
Hub,
 
this
 
UI
 
will
 
display
 
the
 
pricing
 
blocks,
 
billing
 

## Page 12

intervals,  and  feature  unlocks  (e.g.,  Telegram  access,  Push  Alerts,  
"Add
 
to
 
RAG"
 
tool)
 
associated
 
with
 
the
 
premium
 
tiers.
 
○  Registered  State  (Free/Guest  Users):  Displays  the  user's  proﬁle  avatar  
and
 
a
 
prominent
 
"Upgrade"
 
or
 
"Get
 
Elite"
 
Call-to-Action
 
(CTA).
 
This
 
allows
 
users
 
who
 
joined
 
for
 
free
 
to
 
easily
 
discover
 
the
 
Hub's
 
premium
 
oerings
 
and
 
hit
 
a
 
paywall/checkout
 
ﬂow.
 
○  Elite  State  (Premium/Subscribers):  Replaces  the  upgrade  CTA  with  an  
"Elite"
 
badge
 
or
 
premium
 
styling
 
around
 
the
 
user's
 
avatar,
 
granting
 
access
 
to
 
a
 
dropdown
 
menu
 
for
 
managing
 
their
 
subscription,
 
RAG
 
webhooks,
 
and
 
billing
 
seings.
 
●  How  it  Works  page  link:   a  prominent  text  link  or  "info"  icon  placed  immediately  
adjacent
 
to
 
the
 
"Join
 
/
 
Subscribe"
 
and
 
"Sign
 
In"
 
buons
 
in
 
the
 
top
 
Header;
 
this
 
page
 
serves
 
as
 
both
 
an
 
educational
 
tool
 
and
 
a
 
sales
 
pitch
 
for
 
the
 
Elite
 
Tier
 
(see
 
section
 
4.2.7,
 
How
 
it
 
Works).
 
4.2.2  The  Top  Horizontal  Toolbar  (Global  Controls)  A  persistent  horizontal  toolbar  must  be  anchored  to  the  top  of  the  interface,  
providing
 
the
 
user
 
with
 
global
 
navigation
 
and
 
board-speciﬁc
 
control
 
mechanisms.
 
●  Board  Navigation  Menu :  A  dedicated  icon/menu  (e.g.,  a  "Hub  Menu"  or  "Grid"  
icon)
 
that,
 
when
 
clicked,
 
displays
 
a
 
drop-down
 
or
 
modal
 
list
 
of
 
all
 
available
 
boards
 
within
 
the
 
Hub
 
(e.g.,
 
News,
 
Publishers,
 
Events).
 
Clicking
 
a
 
board
 
name
 
immediately
 
navigates
 
the
 
user
 
to
 
that
 
board,
 
making
 
it
 
the
 
active
 
view.
 
●  Taxonomy  &  Sort  Controls:  For  boards  conﬁgured  with  speciﬁc  taxonomies  
(e.g.,
 
categorized
 
by
 
genre,
 
topic,
 
or
 
date),
 
a
 
"Sort"
 
icon
 
must
 
be
 
present
 
in
 
the
 
toolbar.
 
Clicking
 
this
 
icon
 
reveals
 
a
 
menu
 
of
 
relevant
 
sort
 
parameters
 
(e.g.,
 
Sort
 
by
 
Date,
 
Sort
 
by
 
Relevance,
 
Sort
 
by
 
Genre,
 
etc.),
 
allowing
 
the
 
user
 
to
 
dynamically
 
reorder
 
the
 
active
 
board's
 
feed.
 
4.2.3  The  Main  Feed  Layout  (Two-Column  Architecture)  If  we  “divide”  the  presentation/display  area  horizontally  into  4  equal  parts,  with  
two
 
signiﬁcant
 
margins
 
on
 
either
 
side
 
of
 
the
 
display
 
area,
 
the
 
ﬁrst
 
part
 
of
 
the
 
4
 

## Page 13

would  be   the  left  column.  The  2nd  and  3rd  part  must  be  combined  to  form  the  
centre
 
feed
 
column.
 
The
 
remaining
 
fourth
 
part
 
would
 
be
 
the
 
right-most
 
column.
 
Similar
 
to
  
the
 
Brave
 
News
 
presentation
 
on
 
a
 
standard
 
laptop
 
layout:
 
 
When  viewing  a  standard  content  board  (such  as  a  news  feed),  the  page  must  
utilize
 
a
 
two-column
 
layout:
 
●  The  Feed  Filter  (Left  Column) :  A  vertical  sidebar  located  to  the  left  of  the  
main
 
feed.
 
This
 
column
 
dynamically
 
lists
 
all
 
the
 
Monitored
 
Sources
 
("Publishers")
 
that
 
provide
 
content
 
for
 
populating
 
the
 
active
 
board.
 
○  Behavior :  If  a  user  clicks  on  a  speciﬁc  publisher  in  this  list,  the  center  
feed
 
column
 
instantly
 
ﬁlters
 
to
 
display
 
only
 
the
 
cards
 
sourced
 
from
 
that
 
selected
 
publisher
 
(functioning
 
similarly
 
to
 
the
 
Brave
 
News
 
sidebar).
 
○  Board  Selectors :  -  besides  listing  the   names  of  the  publishers,  the  Feed  
Filter
 
column
 
may
 
also
 
list
 
the
 
names
 
of
 
other
 
boards,
 
if
 
the
 
conﬁg
 
seings
 
for
 
such
 
“other
 
board”
 
has
 
been
 
set
 
to
 
“Show
 
in
 
Feed
 
Filter”,
 
which
 
means
 
the
 
name
 
of
 
the
 
particular
 
board
 
(with
 
such
 
seing
 
set
 
to
 
active),
 
will
 
appear
 
in
 
the
 
.
 
styles
 
&
 
conﬁg
 
Oers
 
a
 
navigation
 
alternative
 
to
 
the
 
Board
 
Navigation
 
Menu
 
●  The  Sourced  Content  Column  (Center  Double  Column):  The  primary  
vertical
 
scrollable
 
area
 
where
 
the
 
contracted
 
"Cards"
 
(MMPs)
 
are
 
stacked.
 
The
 
most
 
recent
 
or
 
highest-ranked
 
cards
 
appear
 
at
 
the
 
top,
 
subject
 
to
 
the
 
Sort
 
Controls
 
and
 
Publisher
 
Filters
 
applied
 
by
 
the
 
user.
 


## Page 14

○  Inﬁnite-scroll  feed  of  content  cards  (default  view  for  the  selected  board).  
○  2  presentation  styles  for  cards,  viz.,  Standard  Minimalist  and  Featured:  
 
 3  cards  displayed  in  the  Standard  Minimilist  presentation  style  
 
 
Single
 
card
 
displayed
 
in
 
Featured
 
style
 
 
○  The  Featured  presentation  style  is  used  to  “feature”  content  that  is  
popular,
 
or
 
rated
 
highly
 
relevant,
 
or
 
paid
 
for.
 
The
 
presentation
 
style
 
for
 
a
 
particular
 
card
 
(Standard
 
Minimilist
 
or
 
Features)
 
is
 
deﬁned
 
in
 
the
 
cards
 


## Page 15

metadata,  with  other  elements  (e.g.,  title,  byline,  source/publisher,  
publication
 
date
 
&
 
time,
 
etc.).
 
○  Each  card  displays  in  Contracted  state  by  default:  
■  Eye-catching  thumbnail  (auto-selected  by  Creative  Agent).  
■  Optionally  a  Title  (generated  or  reﬁned  by  agents).  
■  Byline  or  short  summary  (≈150  characters).  
■  Feed  object  category  (e.g.,  news,  tech,  entertainment,  etc.)  
■  Optionally  source  name  +  embedded  proﬁle  link  (clicking  the  
publisher’s
 
name
 
in
 
the
 
card
 
opens
 
a
 
modal/side
 
panel
 
with
 
a
 
short
 
summary
 
of
 
the
 
conﬁgured
 
proﬁle,
 
as
 
per
 
the
 
proﬁle
 
elements
 
the
 
administrator
 
selected
 
in
 
the
 
publisher
 
proﬁle
 
conﬁg,
 
e.g.,
 
publisher’s
 
scorecard,
 
political
 
leaning,
 
objectivity
 
score,
 
user
 
ratings
 
aggregate,
 
etc.
 
-
 
link
 
provided
 
for
 
navigating
 
to
 
the
 
comprehensive
 
proﬁle
  
-
 
the
 
“Publishers/Content
 
Sources”
 
board
 
-
 
if
 
activated
 
for
 
the
 
particular
 
implementation
 
of
 
the
 
template).
 
■  Metadata  tags  (e.g.,  #Rating  #HealthAlert  #Neutral);  the  visible  
outputs
 
of
 
the
 
AI
 
agents
 
and
 
the
 
underlying
 
data
 
that
 
drives
 
the
 
platform's
 
intelligence,
 
serving
 
three
 
critical
 
functions:
 
□  Algorithmic  Matching  (The  Content  Vector):  Tags  generated  by  
the
 
Taste
 
Predictor
 
Agent
 
(e.g.,
 
"Highly
 
Technical,"
 
"Neutral")
 
are
 
combined
 
with
 
the
 
source's
 
reputation
 
to
 
create
 
the
 
"Content
 
Vector".
 
The
 
Rating
 
Proﬁler
 
uses
 
this
 
vector
 
to
 
match
 
the
 
card
 
against
 
a
 
user's
 
personal
 
Taste
 
Graph
 
for
 
the
 
"For
 
You"
 
board.
 □  Contextual  Visual  Cues:  They  act  as  "Taste  Graph  indicators,"  
providing
 
users
 
with
 
subtle
 
visual
 
cues
 
explaining
 
why
 
an
 
article
 
was
 
recommended
 
to
 
them
 
or
 
what
 
the
 
AI
 
determined
 
its
 
sentiment
 
to
 
be.
 □  System  Action  Triggers:  Certain  tags  act  as  routing  rules.  For  
instance,
 
a
 
#HealthAlert
 
tag
 
applied
 
by
 
the
 
Sourcing
 
Agent
 
can
 
trigger
 
an
 
immediate
 
native
 
push
 
notiﬁcation
 
to
 
Telegram
 
subscribers.
 

## Page 16

■  Timestamp  +  priority/urgency  indicator  (if  applicable);  instead  of  
timestamp
 
it
 
coud
 
display
 
“how
 
long
 
ago”
 
it
 
was
 
published,
 
e.g.,
 
“3
 
hours
 
ago”.
 
●  Card  Expansion  &  Interaction  
○  Tap/click  a  card  →  expands  inline  to  Expanded  state:  
■  Full  summary  (Markdown-rendered,  prepared  by  Creative  Agent).  
■  Optional  embedded  elements  (e.g.,  transcript  snippet  from  
Transcriber
 
Agent,
 
translated
 
text).
 
■  Original  source  link  (external).  
●  Action  Bar  (horizontal  icon  bar  at  top  or  boom  of  the  card  with  smallish  
icons,
 
each
 
being
 
a
 
control
 
that
 
activates
 
a
 
particular
 
tool).
 
Tool
 
availability
 
is
 
determined
 
by
 
the
 
type
 
of
 
board
 
(when
 
the
 
administrator
 
deﬁnes
 
a
 
board,
 
the
 
admin
 
would
 
select
 
which
 
tools
 
must
 
be
 
available
 
to
 
users
 
of
 
the
 
boars;
 
tools
 
can
 
be
 
shared
 
across
 
board
 
types.
 
Tools
 
are
 
presented
 
as
 
small
 
icons
 
with
 
the
 
tool
 
name
 
displayed
 
on
 
hover.
 
Tools
 
include:
 
○  Open  /  Drill-down  (Expand  Card) :  Transitions  the  card  from  its  default  
"Contracted
 
Mode"
 
to
 
"Expanded
 
Mode."
 
This
 
action
 
expands
 
the
 
UI
 
to
 
reveal
 
the
 
complete,
 
formaed
 
output
 
of
 
the
 
Creative
 
Agent
 
(e.g.,
 
full
 
Markdown
 
summaries),
 
detailed
 
metadata,
 
the
 
Publisher
 
Scorecard,
 
and
 
extended
 
interaction
 
tools
 
not
 
visible
 
in
 
the
 
contracted
 
feed
 
view.
 
○  Close  /  Go  Back  (Collapse  Card):  Reverses  the  "Open"  action,  collapsing  
the
 
Expanded
 
Mode
 
back
 
into
 
the
 
streamlined
 
Contracted
 
Mode.
 
This
 
restores
 
the
 
user's
 
context
 
within
 
the
 
vertical,
 
scrollable
 
board
 
feed
 
without
 
losing
 
their
 
current
 
position.
 
○  Promote  /  Clap  (Positive  Ranking  Signal):  An  explicit  positive  feedback  
mechanism
 
(implemented
 
via
 
a
 
slider,
 
multi-click
 
buon,
 
or
 
weighted
 
toggle)
 
that
 
feeds
 
directly
 
into
 
the
 
Rating
 
Proﬁler
 
Agent.
 
Activating
 
this
 
tool
 
increases
 
the
 
algorithmic
 
weight
 
of
 
the
 
card's
 
Content
 
Vector,
 

## Page 17

instantly  "training"  the  agent  to  prioritize  and  surface  similar  topics,  tags,  
and
 
sentiments
 
higher
 
up
 
in
 
the
 
user's
 
personal
 
Taste
 
Graph.
 
○  Classify  (Objectivity  &  Leaning  Rating):  Opens  a  structured  rating  
interface
 
allowing
 
the
 
user
 
to
 
evaluate
 
the
 
speciﬁc
 
Monitored
 
Sources
 
Publication.
 
This
 
data
 
feeds
 
directly
 
into
 
the
 
Publisher
 
Proﬁler
 
Agent,
 
dynamically
 
crowdsourcing
 
the
 
publisher's
 
"Establishment
 
Scorecard"
 
by
 
aggregating
 
user
 
assessments
 
on
 
metrics
 
such
 
as
 
political
 
leaning,
 
objectivity,
 
and
 
potential
 
misinformation.
 
○  Comments  (Embedded  Discourse  Board):  Opens  an  "Embedded  Board"  
(Sub-board)
 
dedicated
 
to
 
user
 
discussion
 
speciﬁc
 
to
 
the
 
active
 
card.
 
The
 
icon
 
displays
 
a
 
live
 
count
 
of
 
current
 
comments.
 
When
 
clicked,
 
it
 
allows
 
Registered
 
Users
 
to
 
submit
 
text
 
input,
 
reply
 
to
 
peers,
 
and
 
engage
 
in
 
community-driven
 
peer
 
review
 
of
 
the
 
source
 
material.
 
○  Tag  /  Save  /  Bookmark  (Personal  Curation):  Enables  the  user  to  aach  
personal
 
metadata
 
to
 
a
 
card
 
or
 
add
 
it
 
to
 
a
 
persistent
 
personal
 
collection
 
(e.g.,
 
"Read
 
Later,"
 
"Favorites").
 
Applying
 
this
 
tool
 
makes
 
the
 
speciﬁc
 
card
 
permanently
 
retrievable
 
via
 
the
 
Hub's
 
global
 
ﬁlter
 
and
 
search
 
functionalities,
 
regardless
 
of
 
the
 
card's
 
age
 
or
 
board
 
ranking.
 
○  Send  /  Share  (Distribution):  Invokes  the  device's  native  Web  Share  API  or  
generates
 
a
 
copyable
 
deep-link
 
to
 
distribute
 
the
 
card
 
outside
 
the
 
Xentara
 
Xentara
 
platform.
 
Shared
 
links
 
are
 
conﬁgured
 
to
 
route
 
recipients
 
back
 
to
 
the
 
Hub's
 
Tier
 
1
 
(PWA)
 
runtime,
 
acting
 
as
 
a
 
top-of-funnel
 
acquisition
 
loop
 
for
 
new
 
Casual
 
Users.
 
○  Listen  (Text-to-Speech):  Triggers  an  integrated  Text-to-Speech  (TTS)  
engine
 
to
 
read
 
aloud
 
the
 
AI-generated
 
summary
 
of
 
the
 
card.
 
This
 
leverages
 
the
 
standardized
 
output
 
of
 
the
 
Creative
 
Agent
 
to
 
provide
 
accessibility
 
and
 
a
 
hands-free
 
"podcast-like"
 
utility
 
for
 
users,
 
which
 
is
 
particularly
 
valuable
 
in
 
the
 
mobile/PWA
 
runtimes.
 
○  Translate  (Language  Toggle):  A  dynamic  UI  toggle  that  instantly  swaps  
the
 
displayed
 
text
 
(titles
 
and
 
summaries)
 
between
 
the
 
original
 
source
 
language
 
and
 
the
 
Hub’s
 
(or
 
user’s)
 
default
 
language.
 
This
 
seamlessly
 

## Page 18

surfaces  the  pre-processed  output  generated  by  the  framework's  
Translator
 
Agent.
 
○  Mute  Publisher  (Source  Exclusion):  A  deﬁnitive,  user-level  hard-ﬁlter  
tool.
 
Activating
 
this
 
instantly
 
and
 
permanently
 
removes
 
all
 
past
 
and
 
future
 
content
 
originating
 
from
 
the
 
speciﬁc
 
Monitored
 
Sources
 
source
 
from
 
the
 
user's
 
personal
 
feed.
 
This
 
operates
 
independently
 
of
 
the
 
community's
 
Taste
 
Graph,
 
ensuring
 
the
 
source
 
remains
 
available
 
to
 
others
 
while
 
respecting
 
the
 
individual's
 
boundaries.
 
○  Report  /  Alert  Admin  (Moderation  Flag):  A  security  and  moderation  tool  
that
 
ﬂags
 
the
 
speciﬁc
 
card
 
(or
 
a
 
user
 
comment)
 
for
 
manual
 
review
 
by
 
a
 
Hub
 
Administrator.
 
This
 
is
 
utilized
 
for
 
escalating
 
Terms
 
of
 
Service
 
violations,
 
severe
 
spam,
 
explicit
 
content,
 
or
 
critical
 
ingestion
 
errors
 
made
 
by
 
the
 
Sourcing
 
Agents.
 
○  Show  Less  Like  This  (Negative  Feedback  Signal):  An  explicit  negative  
rating
 
tool
 
that
 
feeds
 
directly
 
into
 
the
 
Rating
 
Proﬁler
 
Agent.
 
Activating
 
this
 
tool
 
instantly
 
penalizes
 
the
 
algorithmic
 
weight
 
of
 
the
 
card's
 
speciﬁc
 
metadata
 
tags
 
and
 
content
 
vector
 
within
 
the
 
user's
 
personal
 
Taste
 
Graph.
 
It
 
serves
 
to
 
quickly
 
"train"
 
the
 
agent
 
to
 
deprioritize,
 
hide,
 
or
 
ﬁlter
 
out
 
similar
 
topics,
 
sentiments,
 
or
 
formats
 
in
 
the
 
user's
 
future
 
feed
 
generations.
 
○  Add  to  RAG  (Knowledge  Base  Export):  [Elite  Users  Only]  A  premium  
data-portability
 
tool
 
that
 
allows
 
the
 
user
 
to
 
push
 
the
 
active
 
card's
 
full
 
content
 
directly
 
into
 
their
 
personal
 
Retrieval-Augmented
 
Generation
 
(RAG)
 
repository
 
or
 
external
 
knowledge
 
base
 
(e.g.,
 
Notion,
 
Obsidian,
 
Custom
 
GPT
 
endpoint,
 
or
 
private
 
vector
 
database).
 
■  Mechanism :  Activating  this  tool  triggers  a  background  webhook  or  
API
 
POST
 
request
 
conﬁgured
 
in
 
the
 
Elite
 
User's
 
proﬁle
 
seings.
 
■  Payload :  The  system  transmits  a  structured  JSON  payload  
containing
 
the
 
raw
 
source
 
text
 
(or
 
transcript),
 
the
 
Creative
 
Agent's
 
Markdown
 
summary,
 
the
 
source
 
URL,
 
and
 
all
 
associated
 
metadata
 
tags
 
(including
 
Publisher
 
Scorecard
 
data
 
and
 
Taste
 
Predictor
 

## Page 19

sentiment),  providing  clean,  pre-processed  data  for  the  user's  
personal
 
AI
 
systems.
 
○  Goto  (Dynamic  Contextual  Navigation):  A  context-aware  navigation  tool  
that
 
provides
 
one
 
or
 
more
 
routing
 
options
 
based
 
on
 
the
 
speciﬁc
 
board's
 
conﬁguration
 
and
 
the
 
entity
 
presented
 
on
 
the
 
card.
 
Because
 
board
 
relationships
 
are
 
conﬁgurable
 
at
 
the
 
Hub
 
level,
 
this
 
tool
 
acts
 
as
 
a
 
dynamic
 
bridge:
 
■  External  Routing:  It  may  provide  an  "Outlink"  to  navigate  the  user  
away
 
from
 
the
 
Hub
 
to
 
the
 
original
 
Monitored
 
Sources
 
Publication
 
(e.g.,
 
viewing
 
an
 
article
 
on
 
the
 
publisher's
 
actual
 
website).
 
■  Internal  Routing:  It  may  provide  deep-links  to  other  related  boards  
within
 
the
 
Hub.
 
For
 
example,
 
when
 
viewing
 
an
 
"Associate
 
Proﬁle"
 
card,
 
the
 
Goto
 
tool
 
may
 
present
 
a
 
sub-menu
 
allowing
 
the
 
user
 
to
 
jump
 
directly
 
to
 
the
 
Hub's
 
"Events"
 
board
 
or
 
"Opportunities"
 
board,
 
automatically
 
ﬁltered
 
to
 
show
 
only
 
items
 
belonging
 
to
 
that
 
speciﬁc
 
associate.
 
●  Hover-Summary  /  Peek  (desktop) :  When  a  user  hovers  their  cursor  over  a  
contracted
 
card
 
in
 
the
 
browser/PWA
 
runtime,
 
the
 
UI
 
must
 
temporarily
 
reveal
 
a
 
"Peek"
 
overlay
 
or
 
expansion
 
containing
 
the
 
following
 
elements
 
without
 
requiring
 
a
 
full
 
click:
 
○  The  Full  AI  Summary :  The  contracted  byline  expands  to  display  the  
complete,
 
Markdown-rendered
 
summary
 
generated
 
by
 
the
 
Creative
 
Agent.
 
○  Publisher  Snapshot :  A  lightweight  tooltip  or  badge  displaying  the  
Publisher's
 
"Establishment
 
Scorecard"
 
(showing
 
their
 
assessed
 
political
 
leaning
 
and
 
objectivity
 
score).
 
○  The  Quick-Action  Bar :  Temporary  exposure  of  primary  interaction  tools  
(e.g.,
 
Promote/Clap,
 
Save,
 
Share),
 
allowing
 
the
 
user
 
to
 
rate
 
or
 
bookmark
 
the
 
content
 
directly
 
from
 
the
 
feed
 
without
 
opening
 
the
 
fully
 
expanded
 
card
 
view.
 

## Page 20

4.2.4  The  Footer  (Utility  &  Support  Layer)  The  Footer  operates  as  a  persistent  utility  and  navigation  layer  anchored  at  the  
boom
 
of
 
the
 
Tier
 
1
 
(PWA/Desktop)
 
runtime.
 
While
 
the
 
Hub
 
Administrator
 
can
 
customize
 
speciﬁc
 
URLs,
 
the
 
framework
 
enforces
 
a
 
standardized
 
layout
 
comprising
 
the
 
following
 
core
 
components:
 
●  Community  Information  (Hub-Speciﬁc)  
○  About  Us:  A  direct  link  to  the  Hub's  foundational  mission  statement,  the  
community
 
rationale,
 
or
 
the
 
expanded
 
"How
 
It
 
Works"
 
module.
 
○  Contact  Us:  A  routing  link  conﬁgured  by  the  Administrator  (e.g.,  
launching
 
an
 
email
 
client,
 
opening
 
a
 
contact
 
form,
 
or
 
directing
 
to
 
a
 
community
 
Discord/Telegram
 
channel).
 
●  Resources  &  Documentation  (The  Qwiki  System)  The  Footer  serves  as  the  
entry
 
point
 
for
 
user
 
education
 
and
 
platform
 
resources:
 
○  User  Documentation  (Qwiki):  A  link  to  the  Hub's  integrated  "Qwiki"  
system.
 
Qwiki
 
is
 
a
 
lightweight,
 
Markdown-based
 
documentation
 
engine
 
hosted
 
within
 
the
 
Hub.
 
It
 
acts
 
as
 
the
 
central
 
repository
 
for
 
all
 
Hub-speciﬁc
 
operational
 
rules,
 
community
 
guidelines,
 
and
 
navigation
 
tutorials.
 
○  Media  &  Updates:  Conﬁgurable  links  to  the  Community  Custodian's  
external
 
or
 
internal
 
media
 
channels,
 
including
 
a
 
Vlog
,
 
Blog
,
 
and
 
an
 
interactive
 
Product
 
Tour
 
for
 
new
 
user
 
onboarding.
 
●  Interactive  Support:  Ask.Snappy  (AI  Assistant)   
Rather  than  relying  solely  on  static  FAQs,  the  footer  provides  a  trigger  to  
launch
 
Ask.Snappy
,
 
the
 
framework's
 
embedded
 
conversational
 
support
 
agent.
 
○  UI  Behavior:  Clicking  "Ask.Snappy"  opens  a  persistent  chat  widget  or  
ﬂoating
 
modal.
 
○  Underlying  Engine:  Ask.Snappy  is  powered  by  a  dedicated  RAG  
(Retrieval-Augmented
 
Generation)
 
pipeline.
 

## Page 21

○  Knowledge  Base:  The  RAG  is  dual-indexed.  It  is  populated  with  the  
comprehensive
 
Xentara
 
Xentara
 
Body
 
of
 
Knowledge
 
(BOK)
 
to
 
answer
 
technical
 
queries
 
about
 
platform
 
navigation
 
and
 
features,
 
as
 
well
 
as
 
Hub-speciﬁc
 
operational
 
data
 
to
 
assist
 
users
 
with
 
community-speciﬁc
 
rules
 
and
 
workﬂows.
 
●  Framework  Aribution  
○  "Powered  by  Xentara  Xentara":  A  mandatory,  unobtrusive  badge  or  text  link  
acknowledging
 
the
 
underlying
 
infrastructure.
 
Clicking
 
this
 
link
 
routes
 
the
 
user
 
away
 
from
 
the
 
active
 
Hub
 
and
 
directs
 
them
 
to
 
the
 
overarching
 
Xentara
 
Xentara
 
public
 
marketing
 
site,
 
serving
 
as
 
a
 
top-of-funnel
 
acquisition
 
channel
 
for
 
new
 
Community
 
Custodians.
 
4.2.5  Contextual  Shortcuts  (Cross-Board  Jumps)  The  interface  must  support  intelligent  "Deep  Linking"  or  "Jumps"  between  distinct  
boards,
 
carrying
 
contextual
 
ﬁlters
 
from
 
the
 
origin
 
card
 
to
 
the
 
destination
 
board.
 
●  Cross-Board  Jump  Logic:  When  viewing  an  expanded  card  or  proﬁle  on  one  
board,
 
the
 
UI
 
must
 
provide
 
shortcut
 
links
 
to
 
related
 
boards.
 
●  Example  Application:  If  a  user  is  on  the  "Publishers"  board  and  opens  the  
proﬁle
 
card
 
for
 
"XYZ
 
Publishers"
 
(viewing
 
their
 
Establishment
 
Scorecard
 
and
 
ratings),
 
a
 
shortcut
 
link
 
labeled
 
"View
 
Publications"
 
may
 
be
 
provided
 
(depending
 
on
 
the
 
conﬁg
 
seings
 
of
 
the
 
board).
 
Clicking
 
this
 
link
 
will
 
then
 
execute
 
a
 
jump
 
to
 
the
 
primary
 
"News"
 
board,
 
automatically
 
applying
 
a
 
ﬁlter
 
so
 
the
 
user
 
only
 
sees
 
news
 
cards
 
published
 
by
 
XYZ
 
Publishers.
 
4.2.6  Embedded  Boards  (Sub-Boards  &  The  Tagging  System)  To  handle  deep,  hierarchical  content  without  cluering  the  top-level  Hub  
navigation,
 
the
 
framework
 
must
 
support
 
"Embedded
 
Boards"
 
(Sub-boards)
 
that
 
exist
 
entirely
 
within
 
the
 
context
 
of
 
a
 
parent
 
Card.
 
●  Sub-Board  Access:  A  prime  example  is  the  "Comments"  section.  Clicking  the  
"Comments"
 
icon
 
on
 
a
 
parent
 
card's
 
Action
 
Bar
 
opens
 
an
 
Embedded
 
Board
 
consisting
 
of
 
user
 
comments
 
related
 
speciﬁcally
 
to
 
that
 
card.
 
This
 
sub-board
 
is
 
not
 
accessible
 
from
 
the
 
global
 
Board
 
Navigation
 
Menu.
 

## Page 22

●  The  Tag  Tool  &  Stream  Following:  Within  an  embedded  board  (like  a  comment  
stream),
 
users
 
must
 
have
 
access
 
to
 
a
 
"Tag
 
Tool."
 
This
 
allows
 
the
 
user
 
to
 
"Follow"
 
or
 
"Tag"
 
that
 
speciﬁc
 
sub-board.
 
(Note:
 
If
 
a
 
user
 
contributes
 
a
 
comment
 
to
 
the
 
stream,
 
the
 
system
 
automatically
 
applies
 
this
 
Tag
 
for
 
them).
 
●  Parent  Board  Filtering:  Tagging  a  sub-board  passes  a  metadata  ﬂag  up  to  the  
parent
 
card.
 
The
 
user
 
can
 
then
 
use
 
the
 
Top
 
Horizontal
 
Toolbar
 
on
 
the
 
main
 
parent
 
board
 
(e.g.,
 
the
 
News
 
board)
 
to
 
ﬁlter
 
the
 
feed
 
by
 
"Followed/Tagged."
 
This
 
instantly
 
narrows
 
the
 
main
 
feed
 
to
 
show
 
only
 
the
 
cards
 
where
 
the
 
user
 
is
 
tracking
 
the
 
embedded
 
sub-board
 
discussions.
 
4.2.7  The  "How  It  Works"  /  About  Module  To  bridge  the  educational  gap  regarding  the  Hub’s  agentic  pipeline  and  to  drive  
premium
 
conversions,
 
the
 
framework
 
must
 
provide
 
a
 
dedicated,
 
non-technical
 
"How
 
It
 
Works"
 
page.
 
●  Link  Placement  &  Accessibility  Because  this  page  serves  as  the  primary  
conversion
 
funnel
 
for
 
Casual
 
Users,
 
access
 
to
 
it
 
must
 
be
 
highly
 
visible
 
and
 
persistent
 
across
 
the
 
UI:
 
○  The  Header  (Primary):  A  prominent  text  link  or  "info"  icon  placed  
immediately
 
adjacent
 
to
 
the
 
"Join
 
/
 
Subscribe"
 
and
 
"Sign
 
In"
 
buons
 
in
 
the
 
top
 
Header.
 
○  The  Feed  Filter  (Secondary):  A  persistent  menu  item  located  at  the  
boom
 
of
 
the
 
left-hand
 
navigation
 
column
 
(Feed
 
Filter),
 
siing
 
alongside
 
user
 
seings
 
and
 
legal/TOS
 
links.
 
○  Empty  States  (Contextual):  If  a  Casual  User  navigates  to  the  "For  You"  
board
 
(which
 
requires
 
an
 
account
 
to
 
function),
 
the
 
empty
 
state
 
must
 
display
 
a
 
brief
 
Call-to-Action
 
linking
 
directly
 
to
 
this
 
page.
 
●  Page  Structure  &  Content  Requirements  The  page  must  be  presented  as  a  
visually
 
engaging,
 
scrolling
 
landing
 
page
 
(or
 
a
 
seamless
 
full-screen
 
modal)
 
rather
 
than
 
a
 
dense
 
wiki.
 
It
 
must
 
contain
 
the
 
following
 
modular
 
sections:
 

## Page 23

○  The  Mission  (Community  Rationale):  A  customizable  text  block  where  
the
 
Community
 
Custodian
 
explains
 
the
 
speciﬁc
 
purpose
 
of
 
their
 
Hub
 
(e.g.,
 
"Why
 
we
 
built
 
this
 
space
 
for
 
Tech
 
Enthusiasts").
 
○  The  Concept  (The  "Engine"  Explainer):  A  simpliﬁed,  non-technical  
explanation
 
of
 
the
 
Xentara
 
Xentara
 
aggregation
 
concept.
 
It
 
should
 
emphasize
 
time-saving
 
and
 
curation
 
(e.g.,
 
"Our
 
AI
 
agents
 
monitor
 
hundreds
 
of
 
trusted
 
sources,
 
transcribe
 
videos,
 
and
 
summarize
 
the
 
noise
 
so
 
you
 
only
 
see
 
what
 
maers."
).
 
○  Trust  &  Transparency  (The  Publisher  Scorecard):  A  brief  explanation  of  
how
 
the
 
community
 
keeps
 
the
 
feed
 
objective.
 
It
 
must
 
explain
 
that
 
human
 
users
 
(not
 
just
 
AI)
 
rate
 
the
 
bias
 
and
 
credibility
 
of
 
the
 
sources.
 
○  The  Value  of  Personalization  (The  Taste  Graph):  An  explanation  of  why  
the
 
user
 
should
 
register.
 
It
 
should
 
outline
 
how
 
their
 
interactions
 
(claps,
 
saves)
 
train
 
their
 
personal
 
algorithm
 
to
 
curate
 
the
 
"For
 
You"
 
board.
 
○  Membership  Tiers  &  Subscriptions  (The  Storefront):  The  culmination  of  
the
 
page.
 
This
 
section
 
displays
 
the
 
dynamic
 
pricing
 
cards
 
conﬁgured
 
by
 
the
 
Administrator.
 
It
 
must
 
clearly
 
contrast
 
the
 
features
 
of
 
the
 
Free/Registered
 
tier
 
(e.g.,
 
basic
 
feed,
 
standard
 
summaries)
 
against
 
the
 
Elite/Subscriber
 
tier
 
(e.g.,
 
Telegram
 
Mini
 
App
 
access,
 
Push
 
Alerts,
 
Text-to-Speech,
 
RAG
 
Export).
 
 
4.2.8  Personalized  Elements  &  Feed  Variations  While  the  Hub  Administrator  deﬁnes  the  global  board  topology,  Registered  and  
Elite
 
Users
 
experience
 
personalized
 
content
 
routing.
 
Depending
 
on
 
the
 
Hub's
 
conﬁguration,
 
users
 
can
 
engage
 
with
 
content
 
across
 
three
 
distinct
 
tiers
 
of
 
personalization:
 
●  The  Uniﬁed  Community  Board  (Global):  
○  Purpose :  The  baseline,  shared  community  experience.  
○  Behavior :  This  board  displays  the  aggregated,  unﬁltered  stream  of  all  
Monitored
 
Media
 
Publications
 
approved
 
by
 
the
 
Administrator
 
for
 
that
 

## Page 24

speciﬁc  category  (e.g.,  "All  Tech  News").  It  relies  on  chronological  or  
global
 
popularity
 
sorting
 
rather
 
than
 
individual
 
user
 
preferences.
 
●  The  User-Curated  Board  (Explicit  Personalization  /  "Following"):  
○  Purpose :  A  strict,  user-deﬁned  feed  based  on  explicit  choices.  
○  Behavior :  The  user  manually  conﬁgures  this  board  by  "Whitelisting"  or  
"Following"
 
a
 
speciﬁc
 
subset
 
of
 
the
 
community's
 
available
 
publishers
 
or
 
tags.
 
For
 
Elite
 
Users,
 
this
 
board
 
may
 
also
 
ingest
 
custom,
 
cross-community
 
personal
 
feeds
 
(e.g.,
 
adding
 
a
 
personal
 
RSS
 
link
 
that
 
only
 
the
 
user
 
sees).
 
If
 
a
 
publisher
 
is
 
not
 
explicitly
 
approved
 
by
 
the
 
user,
 
their
 
content
 
will
 
not
 
appear
 
here.
 
●  The  "For  You"  Board  (Implicit  /  Algorithmic  Personalization):  
○  Purpose :  A  discovery-focused  feed  driven  by  the  Sentrix  AI  pipeline.  
○  Behavior :  This  board  draws  from  the  uniﬁed  community  pool  but  
algorithmically
 
re-ranks
 
and
 
ﬁlters
 
the
 
cards
 
for
 
the
 
individual
 
user.
 
It
 
utilizes
 
the
 
Taste
 
Predictor
 
and
 
Rating
 
Proﬁler
 
to
 
perform
 
collaborative
 
ﬁltering
 
based
 
on
 
the
 
user's
 
historical
 
interaction
 
data
 
(claps,
 
saves,
 
time-on-card)
 
and
 
matches
 
them
 
against
 
similar
 
community
 
clusters.
 
4.2.9  Additional  Global  Features  ○  Dark/light  mode  toggle  (syncs  with  system  preference).  
○  Notiﬁcations  permission  prompt  (for  web  push  of  critical  alerts,  e.g.,  Health  
Alerts—falls
 
back
 
to
 
in-app
 
banners
 
if
 
denied).
 
○  Onboarding  tour  for  ﬁrst-time  visitors  highlighting  boards  and  actions.  
***  Implementation  Note  for  the  Developer:  The  layout  structure  above  represents  the  
standard
 
Tier
 
1
 
(PWA/Browser)
 
runtime.
 
The
 
"Publisher
 
Filter"
 
and
 
"Two-Column
 
Layout"
 
may
 
be
 
condensed
 
into
 
o-canvas
 
sliding
 
menus
 
for
 
mobile-sized
 
browser
 
viewports
 
to
 
preserve
 
screen
 
real
 
estate.
 

## Page 25

5.  The  Telegram-Native  "Mobile  Runtime"  
The  Tier  2  Runtime  utilizes  the  Telegram  messenger  platform  as  a  native  mobile  UI  host.  
Reserved
 
for
 
"Elite
 
Users"
 
(subscribers/authenticated
 
members),
 
this
 
runtime
 
eliminates
 
the
 
need
 
for
 
standalone
 
iOS
 
or
 
Android
 
app
 
development
 
while
 
delivering
 
100%
 
reliable
 
push
 
notiﬁcations
 
and
 
advanced
 
agentic
 
utilities.
 
The  Telegram  Runtime  operates  as  a  hybrid  experience,  utilizing  both  Interactive  Chat  
Messages
 
(for
 
alerts
 
and
 
quick
 
actions)
 
and
 
a
 
Telegram
 
Mini
 
App
 
(TMA)
 
(for
 
deep,
 
visual
 
browsing).
 
5.1  The  Telegram  UI  Host  Paradigm  
Unlike  traditional  Telegram  "Channels"  (which  are  passive,  one-way  broadcasts),  the  
Xentara
 
Xentara
 
framework
 
deploys
 
an
 
interactive
 
Bot
 
accompanied
 
by
 
a
 
Telegram
 
Mini
 
App
 
(TMA).
 
●  The  TMA  Canvas :  When  the  user  taps  a  persistent  "Open  Hub"  buon  inside  the  bot  
chat,
 
a
 
secure,
 
web-based
 
UI
 
slides
 
up
 
over
 
the
 
messenger.
 
This
 
canvas
 
mirrors
 
the
 
rich
 
visual
 
layout
 
of
 
the
 
PWA
 
but
 
is
 
heavily
 
optimized
 
for
 
mobile
 
touch
 
interactions.
 
●  Identity  Bridge  (Instant  Install):  Users  transition  from  the  PWA  to  the  Telegram  
Runtime
 
via
 
a
 
secure
 
"Magic
 
Link"
 
(utilizing
 
the
 
Telegram
 start parameter).  This  
executes
 
a
 
handshake
 
that
 
links
 
their
 
Google
 
SSO
 
identity
 
to
 
their
 
Telegram
 
User
 
ID,
 
synchronizing
 
their
 
Taste
 
Graph
 
and
 
saved
 
content
 
instantly.
 
5.2  Navigation  &  Board  Access  (TMA  Layout)  
Within  the  sliding  TMA  interface,  the  UI  logic  of  the  PWA  is  adapted  for  mobile  
constraints:
 
●  Board  Navigation :  Instead  of  a  top  horizontal  toolbar,  board  navigation  (switching  
between
 
News,
 
Events,
 
Opportunities)
 
is
 
handled
 
via
 
a
 
sticky
 
boom
 
navigation
 
bar
 
or
 
a
 
top-level
 
swipeable
 
tab
 
menu.
 
●  The  Publisher  Filter  &  Sort :  The  left-hand  "Publisher  Filter"  from  the  desktop  UI  is  
converted
 
into
 
an
 
o-canvas
 
slide-out
 
menu
 
or
 
a
 
collapsible
 
dropdown
 
at
 
the
 
top
 
of
 

## Page 26

the  active  feed,  allowing  users  to  quickly  isolate  content  from  speciﬁc  Monitored  
Media
 
entities.
 
Sort
 
controls
 
(Date,
 
Relevance)
 
are
 
housed
 
in
 
an
 
adjacent
 
icon.
 
5.3  Card  Presentation  &  The  Action  Bar  
Cards  in  the  Telegram  Runtime  exist  in  two  distinct  states,  leveraging  Telegram's  native  
capabilities:
 
●  In-Chat  Push  Cards  (Contracted  Mode) :  When  the  system  pushes  an  urgent  alert  
to
 
the
 
user,
 
it
 
arrives
 
as
 
a
 
native
 
Telegram
 
chat
 
bubble
 
containing
 
the
 
contracted
 
AI
 
summary,
 
thumbnail,
 
and
 
metadata
 
tags.
 
●  Telegram  Inline  Keyboards  (Quick  Actions) :  Aached  to  the  boom  of  the  in-chat  
push
 
card
 
is
 
a
 
Telegram
 
Inline
 
Keyboard
 
(a
 
row
 
of
 
native
 
buons).
 
These
 
buons
 
represent
 
primary
 
Action
 
Bar
 
tools
 
(e.g.,
 👍  Promote,  👎  Show  Less,  🔖  Save,  
and
 📖  Expand).  Tapping  these  buons  sends  payload  data  directly  back  to  the  
Rating
 
Proﬁler
 
Agent
 
without
 
opening
 
the
 
TMA.
 
●  TMA  Expanded  Mod e:  When  the  user  taps  📖  Expand,  the  TMA  slides  up,  
presenting
 
the
 
full
 
Expanded
 
Card.
 
This
 
view
 
provides
 
access
 
to
 
the
 
complete
 
Action
 
Bar,
 
including
 
advanced
 
agentic
 
tools
 
like
 
Listen
 
(TTS)
 
and
 
Translate
,
 
as
 
well
 
as
 
the
 
Publisher
 
Scorecard.
 
5.4  Embedded  Boards  &  Cross-Board  Jumps  
Deep  linking  and  hierarchical  navigation  must  function  seamlessly  within  the  Telegram  
environment.
 
●  Comments  (Embedded  Boards) :  Tapping  the  "Comments"  tool  within  the  TMA  
opens
 
the
 
contextual
 
sub-board.
 
Users
 
can
 
read
 
and
 
submit
 
text
 
replies
 
directly
 
within
 
the
 
TMA
 
interface
 
without
 
being
 
kicked
 
out
 
to
 
a
 
browser.
 
●  Cross-Board  Jumps :  "Goto"  actions  function  exactly  as  they  do  in  the  PWA.  Clicking  
a
 
jump
 
link
 
on
 
an
 
"Associate
 
Proﬁle"
 
card
 
will
 
dynamically
 
load
 
the
 
related
 
"Opportunities"
 
board
 
inside
 
the
 
TMA,
 
applying
 
the
 
appropriate
 
associate
 
ﬁlters
 
instantly.
 

## Page 27

5.5  Push  Intelligence  &  Agentic  Alerts  (Active  Delivery)  
The  primary  functional  advantage  of  the  Tier  2  Runtime  is  the  "Active  Delivery"  
mechanism
 
driven
 
by
 
the
 
Xentara
 
Pipeline.
 
●  Critical  Tag  Routing :  The  Admin  Console  can  conﬁgure  speciﬁc  metadata  tags  (e.g.,  #HealthAlert or  #Urgent)  to  bypass  passive  boards.  When  the  Sourcing  Agent  
applies
 
one
 
of
 
these
 
tags
 
to
 
a
 
new
 
card,
 
the
 
Bot
 
actively
 
pushes
 
a
 
native
 
notiﬁcation
 
to
 
the
 
user's
 
phone
 
lock
 
screen.
 
●  Personalized  Threshold  Alerts :  Because  the  Telegram  Bot  is  synced  with  the  user's  
Taste
 
Graph,
 
the
 
Rating
 
Proﬁler
 
Agent
 
can
 
trigger
 
silent
 
or
 
active
 
push
 
notiﬁcations
 
when
 
a
 
newly
 
ingested
 
card
 
achieves
 
a
 
high
 
similarity
 
score
 
(e.g.,
 
>95%
 
match)
 
against
 
the
 
user's
 
speciﬁc
 
interests.
 
6.  User  Taxonomy  &  The  Administrator  Console  
This  section  deﬁnes  the  hierarchical  user  access  levels  across  the  Xentara  Xentara  Hub  and  
the
 
functional
 
requirements
 
for
 
the
 
Administrator
 
Console,
 
which
 
acts
 
as
 
the
 
centralized
 
control
 
plane
 
for
 
the
 
Hub's
 
agentic
 
pipeline
 
and
 
board
 
conﬁgurations.
 
6.1    User  Taxonomy  &  Access  Levels  
To  support  a  tiered  engagement  and  monetization  strategy,  the  framework  must  
enforce
 
the
 
following
 
four
 
distinct
 
user
 
roles:
 
●  Casual  User  (Anonymous) :  An  unauthenticated  user  accessing  the  Tier  1  Runtime  
(PWA/Browser).
 
Casual
 
users
 
can
 
only
 
view
 
"Public"
 
boards,
 
read
 
contracted
 
cards,
 
and
 
use
 
the
 
"Hover-Summary/Peek"
 
function.
 
They
 
cannot
 
utilize
 
Action
 
Bar
 
tools
 
that
 
require
 
identity
 
(e.g.,
 
Promote,
 
Classify,
 
Comments,
 
or
 
Save)
 
and
 
do
 
not
 
have
 
a
 
personalized
 
Taste
 
Graph.
 
●  Registered  User  (Authenticated  Guest) :  A  user  authenticated  via  a  standard  SSO  
provider
 
(e.g.,
 
Google
 
OAuth)
 
accessing
 
the
 
Tier
 
1
 
Runtime.
 
They
 
have
 
access
 
to
 
standard
 
boards
 
and
 
a
 
personalized
 
feed.
 
They
 
can
 
utilize
 
all
 
standard
 
Action
 
Bar
 
tools
 
(Promote,
 
Classify,
 
Tag,
 
Comment).
 
Their
 
interactions
 
actively
 
train
 
their
 
personal
 
Taste
 
Graph
 
and
 
contribute
 
to
 
the
 
community's
 
Publisher
 
Scorecards.
 

## Page 28

●  Elite  User  (Subscriber ):  A  premium  authenticated  user  with  linked  access  to  the  Tier  
2
 
Runtime
 
(Telegram
 
Mini
 
App).
 
Elite
 
Users
 
gain
 
access
 
to
 
all
 
restricted/premium
 
boards,
 
100%
 
reliable
 
push
 
alerts
 
for
 
critical
 
tags
 
(e.g.,
 
#HealthAlert),
 
and
 
full
 
use
 
of
 
the
 
advanced
 
agentic
 
tools
 
(Listen/TTS,
 
Translate).
 
○  Personal  Integrations  (RAG  Export):  Elite  Users  are  provided  with  an  
"Integrations"
 
seings
 
panel
 
within
 
their
 
proﬁle.
 
This
 
allows
 
the
 
user
 
to
 
deﬁne
 
a
 
target
 
Webhook
 
URL
 
and
 
an
 
Authorization
 
Header
 
(API
 
Key).
 
Conﬁguring
 
this
 
enables
 
the
 
"Add
 
to
 
RAG"
 
Action
 
Bar
 
tool,
 
allowing
 
the
 
user
 
to
 
seamlessly
 
export
 
cleaned
 
JSON
 
payloads
 
(source
 
text,
 
AI
 
summaries,
 
and
 
metadata)
 
directly
 
into
 
their
 
personal
 
Retrieval-Augmented
 
Generation
 
(RAG)
 
repositories
 
or
 
private
 
knowledge
 
bases.
 
●  Administrator  (Community  Custodian) :  A  special  class  of  user  with  elevated  
credentials
 
granting
 
access
 
to
 
the
 
secure
 
Administrator
 
Console.
 
Administrators
 
do
 
not
 
just
 
consume
 
content;
 
they
 
dictate
 
the
 
ingestion,
 
curation,
 
and
 
governance
 
rules
 
for
 
the
 
entire
 
Hub.
 
6.2  The  Administrator  Console  (Control  Plane)  
The  Admin  Console  is  a  secure,  web-based  dashboard  decoupled  from  the  primary  Hub  
UI.
 
It
 
provides
 
the
 
Administrator
 
with
 
no-code
 
tools
 
to
 
orchestrate
 
the
 
7-agent
 
pipeline
 
and
 
manage
 
the
 
Hub's
 
topology.
 
6.2.1  Source  &  Publisher  Management  ●  Monitored  Sources  Registry :  The  Admin  must  be  able  to  add,  edit,  or  remove  
source
 
endpoints
 
(e.g.,
 
YouTube
 
Channel
 
URLs,
 
RSS
 
feeds,
 
X
 
handles,
 
speciﬁc
 
blogs).
 
●  Publisher  Whitelisting:  The  Admin  must  be  able  to  approve  or  reject  
publishers,
 
creating
 
a
 
curated
 
"Monitored
 
Sources
 
List"
 
that
 
dictates
 
which
 
external
 
entities
 
the
 
Sourcing
 
Agents
 
are
 
allowed
 
to
 
pull
 
from.
 
●  Source-to-Agent  Routing :  The  Admin  must  be  able  to  explicitly  assign  
ingestion
 
agents
 
to
 
speciﬁc
 
sources
 
(e.g.,
 
toggling
 
the
 
Transcriber
 
Agent
 
ON
 
for
 
a
 
newly
 
added
 
YouTube
 
channel).
 

## Page 29

6.2.2  Board  Typology  &  Presentation  Architecture  The  Xentara  Xentara  Framework  utilizes  a  polymorphic  board  architecture.  The  
Admin
 
must
 
be
 
able
 
to
 
deﬁne
 
up
 
to
 
10
 
distinct
 
boards
 
per
 
Hub
 
(e.g.,
 
News,
 
Events,
 
Opportunities).
 
Boards
 
are
 
not
 
restricted
 
to
 
standard
 
vertical
 
feeds
 
of
 
external
 
media;
 
rather,
 
when
 
an
 
Administrator
 
conﬁgures
 
a
 
new
 
board,
 
they
 
must
 
assign
 
it
 
a
 
speciﬁc
 
Board
 
Archetype
.
 
The  selected  Archetype  strictly  governs  the  board's  visual  presentation,  the  
structural
 
schema
 
of
 
its
 
Cards,
 
its
 
available
 
Action
 
Bar
 
tools,
 
and
 
its
 
internal
 
classiﬁcation
 
taxonomy.
 
6.2.2.1   Board  Archetypes  &  Card  Schemas  The  framework  supports  the  following  core  Board  Archetypes,  each  
utilizing
 
a
 
specialized
 
Card
 
structure:
 
●  Standard  Feed  (News  &  Notiﬁcations) :  The  default  vertical  scrollable  
list.
 
Cards
 
prioritize
 
headlines,
 
AI
 
summaries,
 
and
 
Publisher
 
Scorecards.
 
●  Calendar  /  Chronological  (events,  projects,  fairs) :  UI  transitions  to  a  
date-based
 
grid,
 
timeline,
 
or
 
agenda
 
view.
 
The
 
Card
 
schema
 
enforces
 
mandatory
 
start_date,
 
end_date,
 
and
 
location
 
metadata
 
ﬁelds.
 
●  Registry  /  Directory  (Institutions,  Associations,  Proﬁles) :  A  grid  or  list  
view
 
optimized
 
for
 
static
 
entities
 
rather
 
than
 
time-sensitive
 
news.
 
Cards
 
prioritize
 
contact
 
information,
 
leadership
 
proﬁles,
 
and
 
historical
 
ratings.
 
●  Marketplace  (Opportunities,  Oers,  Help  Requests) :  Optimized  for  
transactional
 
or
 
action-oriented
 
content.
 
Cards
 
feature
 
explicit
 
call-to-action
 
buons
 
(e.g.,
 
"Apply,"
 
"Claim")
 
and
 
status
 
ﬂags
 
(e.g.,
 
"Open,"
 
"Fulﬁlled").
 
●  Interactive  /  Discourse  (Chatgroups,  Forums) :  Thread-based  UI  
focusing
 
on
 
user-generated
 
text
 
inputs
 
rather
 
than
 
external
 
AI-summarized
 
content.
 

## Page 30

●  Personal  /  Gamiﬁed  (My  Tasks,  "Helpende  Hand"):  User-speciﬁc  
private
 
boards
 
displaying
 
personal
 
assignments,
 
saved
 
notiﬁcations,
 
or
 
community
 
reward
 
metrics
 
(tracking
 
likes,
 
views,
 
and
 
shares
 
for
 
gamiﬁed
 
reputation).
 
6.2.2.2   Card  UI  Presentation  Format  The  underlying  structural  schema  and  UI  presentation  format  of  a  Card,  
determined
 
by
 
its
 
parent
 
Board
 
Archetype.
 
The
 
framework
 
abstracts
 
all
 
content
 
into
 
four
 
primary
 
data
 
structures:
 
●  Narrative  Card:  Optimized  for  text-heavy  content  (e.g.,  News  Articles,  
Notiﬁcations,
 
Discourse).
 
Prioritizes
 
headlines,
 
the
 
Creative
 
Agent's
 
Markdown
 
summaries,
 
and
 
publisher
 
metadata.
 
●  Chronological  Card:  Optimized  for  time-bound  data  (e.g.,  Events,  
Project
 
Schedules,
 
"Boerejolle").
 
Prioritizes
 start_date,  end_date,  location tags,  and  calendar-syncing  tools.  
●  Entity  Card:  Optimized  for  static  proﬁles  and  registries  (e.g.,  Publisher  
Scorecards,
 
Associate
 
Proﬁles,
 
Institutions).
 
Prioritizes
 
key-value
 
aributes,
 
avatars/logos,
 
contact
 
details,
 
and
 
historical
 
ratings
 
over
 
narrative
 
text.
 
●  Transactional  Card:  Optimized  for  actionable  listings  (e.g.,  
Marketplace
 
Oers,
 
Opportunities,
 
Help
 
Requests).
 
Prioritizes
 
explicit
 
state
 
ﬂags
 
(e.g.,
 
Open/Closed/Fulﬁlled),
 
pricing
 
or
 
bounty
 
metrics,
 
and
 
primary
 
Call-to-Action
 
(CTA)
 
buons.
 
6.2.2.3.  Source  Agnosticism  and  Content  Routing  The  framework  handles  data  ingestion  and  board  population  dierently  
based
 
on
 
the
 
assigned
 
Board
 
Archetype
 
and
 
explicit
 
routing
 
conﬁgurations:
 
●  External  Monitored  Media  Boards:  Populated  autonomously  by  the  
Xentara
 
Agentic
 
Pipeline
 
pulling
 
from
 
whitelisted
 
publishers.
 
For
 
these
 
boards,
 
the
 
Administrator
 
must
 
conﬁgure
 
explicit
 
Routing
 
Rules
 
to
 
dictate
 
where
 
processed
 
content
 
is
 
displayed:
 

## Page 31

○  Publisher  Origin  Mapping:  Routing  all  content  originating  from  a  
speciﬁc
 
publisher
 
(e.g.,
 
Publisher
 
A
)
 
strictly
 
to
 
a
 
designated
 
board
 
(e.g.,
 
the
 
News
 
board).
 
○  Tag-Based  Routing:  Dynamically  routing  content  based  on  
metadata
 
tags
 
assigned
 
by
 
the
 
Sourcing
 
Agent
 
(e.g.,
 
automatically
 
sending
 
any
 
card
 
tagged
 
with
 #Events,  regardless  
of
 
its
 
publisher,
 
directly
 
to
 
the
 
Community
 
Calendar
 
board).
 
●  Internal  System  Boards:  Populated  manually  via  Administrator  input,  
user
 
submissions,
 
or
 
internal
 
API
 
integrations
 
(e.g.,
 
Registry
 
boards
 
or
 
Gamiﬁed
 
"My
 
Tasks"
 
boards).
 
These
 
bypass
 
the
 
external
 
Sourcing
 
Agents
 
and
 
external
 
routing
 
rules,
 
but
 
may
 
still
 
utilize
 
the
 
Rating
 
Proﬁler
 
and
 
Translator
 
agents
 
for
 
internal
 
processing
 
and
 
presentation.
 
6.2.2.4.  Intra-Board  Classiﬁcation  (Taxonomies)  While  the  Archetype  deﬁnes  the  board's  overall  structure,  the  
Classiﬁcation
 
System
 
deﬁnes
 
how
 
content
 
is
 
organized
 
within
 
that
 
single
 
board.
 
●  Administrators  can  deﬁne  a  custom  taxonomy  for  each  board  (e.g.,  
conﬁguring
 
a
 
News
 
board
 
with
 
categories
 
for
 
International,
 
Local,
 
Economics,
 
or
 
an
 
Events
 
board
 
with
 
Online,
 
In-Person,
 
Hybrid).
 
●  These  classiﬁcations  are  presented  to  the  user  via  the  Top  Horizontal  
Toolbar
 
(as
 
deﬁned
 
in
 
Section
 
4.2.1)
 
or
 
the
 
Feed
 
Filter,
 
allowing
 
users
 
to
 
dynamically
 
sort
 
and
 
isolate
 
content
 
within
 
the
 
active
 
board.
 
6.2.2.5.  Feature  Limitations  &  Conﬁguration  ●  The  assigned  Archetype  hardcodes  certain  system  limitations  (e.g.,  
an
 
"Events
 
Calendar"
 
board
 
cannot
 
function
 
without
 
chronological
 
metadata).
 
●  However,  within  those  constraints,  the  Administrator  retains  modular  
control
 
to
 
toggle
 
speciﬁc
 
features
 
on
 
or
 
o
 
(e.g.,
 
enabling
 
or
 
disabling
 
the
 
"Comments"
 
Action
 
Bar
 
tool
 
on
 
an
 
"Institutions
 
Registry"
 
board).
 

## Page 32

6.2.3  Agent  Tuning  &  Governance  ●  Creative  Agent  Prompting:  The  Admin  must  be  able  to  conﬁgure  the  
summarization
 
rules
 
(e.g.,
 
seing
 
maximum
 
character
 
limits
 
for
 
Contracted
 
Mode,
 
or
 
deﬁning
 
the
 
tone—such
 
as
 
"Academic"
 
or
 
"Casual"—for
 
the
 
Expanded
 
AI
 
Summaries).
 
●  Taste  Predictor  Seeding :  The  Admin  must  be  able  to  upload  or  paste  a  "Seed  
Document"
 
(a
 
text
 
example
 
of
 
the
 
community's
 
ideal
 
content).
 
The
 
Taste
 
Predictor
 
Agent
 
uses
 
this
 
seed
 
as
 
the
 
baseline
 
to
 
pre-rank
 
and
 
evaluate
 
new,
 
unrated
 
content.
 
●  Translation  Defaults :  The  Admin  must  be  able  to  deﬁne  the  Hub’s  primary  
default
 
language
 
and
 
conﬁgure
 
the
 
Translator
 
Agent
 
to
 
auto-translate
 
speciﬁc
 
foreign-language
 
sources.
 
6.2.4  Analytics  &  Community  Health  ●  Publisher  Scorecard  Overview :  The  Admin  must  be  able  to  view  the  
aggregated
 
ratings
 
of
 
all
 
Monitored
 
Sources
 
entities,
 
seeing
 
how
 
the
 
community
 
classiﬁes
 
their
 
political
 
leaning
 
and
 
objectivity.
 
●  Taste  Graph  Clustering :  A  visual  or  statistical  dashboard  allowing  the  Admin  to  
see
 
user
 
sentiment
 
trends
 
(e.g.,
 
identifying
 
if
 
a
 
large
 
segment
 
of
 
the
 
community
 
is
 
consistently
 
hiding/downvoting
 
a
 
speciﬁc
 
topic).
 
●  Moderation  Queue :  A  dedicated  inbox  where  the  Admin  can  review  items  
ﬂagged
 
by
 
users
 
via
 
the
 
"Report
 
/
 
Alert
 
Admin"
 
tool,
 
with
 
options
 
to
 
delete
 
the
 
oending
 
comment
 
or
 
ban
 
the
 
user.
 
6.2.5  Marketplace  &  Ad  Campaign  Console   To  support  platform  monetization  and  sponsored  placements,  the  Admin  Console  
must
 
include
 
a
 
dedicated
 
module
 
for
 
managing
 
paid
 
"Ad
 
Cards"
 
within
 
the
 
Hub's
 
organic
 
feeds.
 
●  Campaign  Manager:  The  Admin  must  be  able  to  create,  schedule,  and  manage  
"Sponsored
 
Cards."
 
These
 
cards
 
mimic
 
the
 
UI
 
of
 
standard
 
contracted/expanded
 
cards
 
but
 
must
 
be
 
visually
 
demarcated
 
(e.g.,
 
tagged
 
as
 
"Sponsored")
 
and
 
bypass
 
the
 
standard
 
ingestion
 
pipeline.
 

## Page 33

●  Injection  Ratio  Engine:  The  Admin  must  be  able  to  deﬁne  the  display  
frequency
 
of
 
Sponsored
 
Cards
 
for
 
each
 
speciﬁc
 
board.
 
(e.g.,
 
conﬁguring
 
the
 
"News"
 
board
 
to
 
dynamically
 
inject
 
1
 
Sponsored
 
Card
 
for
 
every
 
8
 
organic
 
cards
 
as
 
the
 
user
 
scrolls).
 
●  Taste  Proﬁle  Targeting:  The  Admin  must  be  able  to  apply  targeting  rules  to  
Sponsored
 
Cards
 
based
 
on
 
the
 
Hub's
 
aggregated
 
metadata
 
tags.
 
This
 
allows
 
an
 
ad
 
to
 
be
 
shown
 
only
 
to
 
users
 
whose
 
Taste
 
Graph
 
strongly
 
aligns
 
with
 
speciﬁc
 
topics
 
(e.g.,
 
targeting
 
a
 
"Veterinary
 
Services"
 
ad
 
strictly
 
to
 
users
 
who
 
frequently
 
engage
 
with
 
#Health
 
tags),
 
ensuring
 
high
 
ad
 
relevance
 
without
 
exposing
 
or
 
compromising
 
individual
 
user
 
data.
 
●  Campaign  Analytics :  A  reporting  dashboard  for  the  Admin  to  track  the  
performance
 
of
 
Sponsored
 
Cards,
 
speciﬁcally
 
tracking
 
impressions
 
(views
 
in
 
the
 
feed)
 
and
 
conversion
 
clicks
 
via
 
the
 
"Goto"
 
Action
 
Bar
 
tool.
 
6.2.6  Outbound  Syndication  &  Social  Integration   To  facilitate  audience  acquisition  and  external  marketing,  the  Admin  Console  
must
 
support
 
outbound
 
webhook
 
integrations
 
to
 
the
 
Hub’s
 
external
 
social
 
media
 
presences
 
(e.g.,
 
X,
 
Facebook
 
Pages,
 
Public
 
WhatsApp
 
Channels).
 
●  Syndication  Triggers :  The  Administrator  must  be  able  to  conﬁgure  rules  that  
dictate
 
which
 
processed
 
cards
 
are
 
automatically
 
pushed
 
to
 
external
 
channels.
 
These
 
triggers
 
include:
 
○  Tag-Based  Auto-Posting:  Automatically  syndicating  cards  that  possess  
speciﬁc
 
metadata
 
tags
 
(e.g.,
 #BreakingNews).  
○  Threshold-Based  Syndication:  Automatically  syndicating  cards  that  
achieve
 
a
 
speciﬁc
 
community
 
engagement
 
score
 
(e.g.,
 
reaching
 
50
 
Claps).
 
○  Manual  Syndication:  A  dedicated  Administrator-only  Action  Bar  tool  
allowing
 
the
 
manual
 
push
 
of
 
an
 
active
 
card
 
to
 
connected
 
social
 
accounts.
 
●  Payload  Formaing :  Outbound  posts  must  automatically  format  to  include  the  
contracted
 
headline,
 
a
 
truncated
 
AI
 
summary,
 
and
 
a
 
direct
 
referral
 
link
 
routing
 
the
 
external
 
user
 
back
 
to
 
the
 
Hub's
 
Tier
 
1
 
(PWA)
 
runtime.
 

## Page 34

6.2.7  The  Curation  Inbox  (User  Submissions)   To  support  decentralized,  community-driven  content  sourcing,  the  Admin  
Console
 
must
 
feature
 
a
 
dedicated
 
"Curation
 
Inbox."
 
●  Ingestion :  When  Elite  Users  forward  links,  articles,  or  text  directly  to  the  Hub's  
connected
 
WhatsApp
 
or
 
Telegram
 
bots,
 
the
 
Sourcing
 
Agent
 
intercepts
 
and
 
structures
 
the
 
content,
 
placing
 
it
 
in
 
a
 
"Pending"
 
state
 
within
 
this
 
inbox.
 
●  Admin  Processing:  The  Administrator  can  review  the  queue  of  user  
submissions.
 
With
 
a
 
single
 
click,
 
the
 
Admin
 
can
 
"Approve"
 
a
 
submission,
 
triggering
 
the
 
rest
 
of
 
the
 
agentic
 
pipeline
 
(Summarization,
 
Taste
 
Prediction)
 
and
 
routing
 
the
 
ﬁnalized
 
card
 
to
 
the
 
appropriate
 
public
 
board.
 
●  Aribution :  Approved  cards  generated  via  this  inbox  must  include  a  metadata  
badge
 
crediting
 
the
 
submiing
 
user
 
(e.g.,
 
"Recommended
 
by
 
@UserHandle"
),
 
incentivizing
 
community
 
participation.
 
6.3  Administrator  Workﬂow  Summary  
The  Administrator  Console  is  designed  to  facilitate  a  logical,  linear  workﬂow  for  the  
Community
 
Custodian.
 
Seing
 
up
 
and
 
managing
 
a
 
Xentara
 
Xentara
 
Hub
 
follows
 
a
 
standard
 
ﬁve-step
 
operational
 
loop:
 
1.  Source  Deﬁnition  (The  "Where"):  The  Admin  inputs  raw  source  endpoints  
(YouTube
 
channels,
 
RSS
 
feeds,
 
X
 
handles)
 
into
 
the
 
Monitored
 
Sources
 
Registry
 
and
 
explicitly
 
whitelists
 
the
 
approved
 
publishers.
 
2.  Agent  Assignment  &  Tuning  (The  "How"):  The  Admin  conﬁgures  the  intelligence  
pipeline
 
by
 
toggling
 
speciﬁc
 
agents
 
for
 
speciﬁc
 
sources
 
(e.g.,
 
turning
 
on
 
the
 
Transcriber
 
for
 
video
 
feeds),
 
deﬁning
 
the
 
default
 
translation
 
language,
 
and
 
uploading
 
"Seed
 
Documents"
 
to
 
calibrate
 
the
 
Taste
 
Predictor.
 
3.  Topology  &  Routing  (The  "Where  To"):  The  Admin  creates  the  Hub's  visual  
structure
 
(up
 
to
 
10
 
boards)
 
and
 
maps
 
the
 
processed
 
agent
 
outputs
 
to
 
their
 
respective
 
boards.
 
Additionally,
 
the
 
Admin
 
conﬁgures
 
Outbound
 
Syndication
 
rules,
 
dictating
 
which
 
tags
 
or
 
highly-rated
 
cards
 
are
 
automatically
 
pushed
 
out
 
to
 
the
 
Hub's
 
external
 
social
 
media
 
channels.
 

## Page 35

4.  Monetization  Insertion  (The  "Revenue"):  (Optional)  The  Admin  accesses  the  
Campaign
 
Console
 
to
 
upload
 
Sponsored
 
Cards,
 
deﬁne
 
target
 
Taste
 
Proﬁles,
 
and
 
set
 
the
 
injection
 
ratio
 
for
 
the
 
organic
 
feeds.
 
5.  Monitoring  &  Governance  (The  "Iteration"):  Once  the  Hub  is  live,  the  Admin  
continuously
 
monitors
 
the
 
Analytics
 
dashboard
 
to
 
review
 
Publisher
 
Scorecards,
 
observe
 
Tast
e
 
Graph
 
clustering,
 
handle
 
ﬂagged
 
items
 
in
 
the
 
Moderation
 
Queue,
 
and
 
approve
 
or
 
reject
 
community-recommended
 
links
 
via
 
the
 
Curation
 
Inbox—adjusting
 
sources
 
and
 
agent
 
prompts
 
as
 
the
 
community
 
evolves.
 
7.  Key  System  Workﬂows  &  User  Journeys  (Value  Flows)  
This  section  maps  the  chronological  interactions  between  the  system's  Actors  (Users,  
Administrators,
 
and
 
AI
 
Agents)
 
to
 
illustrate
 
the
 
core
 
value
 
loops
 
and
 
operational
 
sequences
 
of
 
the
 
Xentara
 
Xentara
 
Framework.
 
7.1   User  Enrollment  &  Onboarding  Flow  
Actors :  Casual  Visitor  →  Registered  User  →  Elite  User(Subscriber)  
Purpose :  Establish  identity,  unlock  interactive  tools,  and  drive  funnel  conversion  toward  
the
 
premium
 
Tier
 
2
 
runtime.
 
Key  steps :  
1.  Discovery :  The  Casual  User  visits  the  Hub's  custom  domain  (Tier  1  PWA)  and  
browses
 
public
 
boards
 
in
 
a
 
read-only
 
state.
 
2.  Registration :  The  user  clicks  "Sign  In"  (via  Google  Auth/SSO)  to  create  a  basic  
proﬁle,
 
becoming
 
a
 
Registered
 
User.
 
They
 
gain
 
access
 
to
 
the
 
"For
 
You"
 
board
 
and
 
standard
 
Action
 
Bar
 
tools.
 
3.  Premium  Upgrade  (Optional) :  The  user  accesses  the  "Join/Subscribe"  module  to  
purchase
 
a
 
Hub
 
membership.
 
4.  Runtime  Transition :  Upon  subscribing,  the  Elite  User  clicks  a  secure  "Magic  Deep  
Link"
 
that
 
instantly
 
launches
 
the
 
Telegram
 
Bot,
 
synchronizing
 
their
 
web
 
proﬁle
 
with
 
their
 
native
 
Telegram
 
identity
 
and
 
unlocking
 
the
 
Tier
 
2
 
Mini
 
App.
 

## Page 36

7.2  Content  Consumption  &  Interaction  Flow  (The  Core  Value  Loop)  
Actors :  Registered  User  /  Elite  User   
Purpose :  Deliver  personalized  agentically  intelligence  and  collect  explicit  feedback  to  
train
 
the
 
predictive
 
models.
 
Key  steps :  
1.  Discovery :  The  user  navigates  to  a  speciﬁc  board  (e.g.,  News  or  For  You ).  
2.  Scanning :  The  user  scrolls  the  inﬁnite  feed  of  minimalist  Contracted  Tiles.  
3.  Expansion :  The  user  taps  a  tile  (or  hovers  on  desktop)  to  expand  the  card,  
revealing
 
the
 
Creative
 
Agent's
 
full
 
Markdown
 
summary
 
and
 
the
 
Publisher
 
Scorecard.
 
4.  Interaction :  The  user  utilizes  the  Action  Bar  to  engage  (e.g.,  applying  the  
Promote/Clap
,
 
Classify
,
 
or
 
Show
 
Less
 
Like
 
This
 
tools).
 
5.  Algorithmic  Update:  The  interaction  payload  is  instantly  routed  to  the  Rating  
Proﬁler
 
Agent,
 
dynamically
 
reﬁning
 
the
 
user's
 
personal
 
Taste
 
Graph
 
and
 
adjusting
 
the
 
community's
 
baseline
 
metrics
 
for
 
that
 
speciﬁc
 
publisher.
 
7.3  User-Submied  Content  Flow  (Collective  Intelligence)  
Actors :  Elite  User  →  Sourcing  Agent  →  Administrator   
Purpose :  Enable  premium  community  members  to  act  as  decentralized  human  
ingestion
 
sources.
 
Key  steps:  
1.  Submission :  An  Elite  User  forwards  an  external  article,  link,  or  media  ﬁle  directly  to  
the
 
Hub's
 
Telegram
 
Bot
 
chat
 
interface.
 
2.  Agentic  Validation:  The  Sourcing  Agent  intercepts  the  link,  ﬁltering  for  malware,  
duplicates,
 
or
 
dead
 
endpoints.
 
3.  Pipeline  Processing :  If  valid,  the  link  is  pushed  through  the  standard  Xentara  
pipeline
 
(Transcriber,
 
Translator,
 
Creative
 
Agent)
 
to
 
generate
 
a
 
standardized
 
Card.
 

## Page 37

4.  Publishing  /  Escalation :  Depending  on  Admin  routing  rules,  the  card  is  either  
auto-published
 
to
 
a
 
designated
 
"Community
 
Submissions"
 
board,
 
or
 
placed
 
in
 
the
 
Admin
 
Moderation
 
Queue
 
for
 
manual
 
approval.
 
5.  User  Recognition  
7.4  Proﬁle  &  Integration  Management  Flow  
Actors :  Registered  User  /  Elite  User   
Purpose :  Empower  users  to  customize  their  feed  rules  and  conﬁgure  external  data  
portability.
 
Key  steps:  
1.  Access :  The  user  opens  their  Proﬁle  Dashboard  via  the  Feed  Filter  menu.  
2.  Identity  &  Taxonomy :  The  user  edits  their  biography,  display  name,  and  explicit  
topic
 
interests.
 
3.  Hard  Filtering :  The  user  manages  their  "Muted  Publishers"  list,  explicitly  blocking  
speciﬁc
 
monitored
 
sources
 
from
 
their
 
feed.
 
4.  RAG  Conﬁguration  (Elite  Only) :  The  Elite  User  accesses  the  "Integrations"  tab,  
inpuing
 
their
 
target
 
Webhook
 
URL
 
and
 
API
 
Authorization
 
Header,
 
permanently
 
enabling
 
the
 
"Add
 
to
 
RAG"
 
Action
 
Bar
 
tool.
 
7.5  Sponsored  Placement  Flow  (Monetization)  
Actors :  External  Advertiser  →  Administrator  →  Registered  User   
Purpose :  Execute  and  manage  natively  integrated,  non-intrusive  monetization  within  
the
 
Hub
 
feeds.
 
Key  steps:  
1.  Advertiser  accesses  Advertiser  Console  (separate  portal  or  admin-managed).  
2.  Admin  reviews/approves  via  Marketplace  &  Ad  Console.  

## Page 38

3.  Campaign  Creation :  The  Administrator  utilizes  the  Ad  Console  to  upload  a  new  
campaign,
 
deﬁning
 
the
 
Sponsored
 
Card's
 
content,
 
the
 
target
 
Taste
 
Proﬁle
 
metadata
 
(e.g.,
 
target
 
users
 
who
 
follow
 #Tech),  and  the  speciﬁc  target  boards.  
4.  Injection :  The  Injection  Ratio  Engine  activates,  seamlessly  blending  the  Sponsored  
Card
 
into
 
the
 
target
 
boards
 
at
 
the
 
deﬁned
 
frequency
 
(e.g.,
 
1
 
ad
 
per
 
10
 
organic
 
cards).
 
5.  Conversion :  A  user  matching  the  target  Taste  Graph  views  the  feed,  clicks  the  
Sponsored
 
Card's
 
primary
 
CTA
 
("Goto"
 
tool),
 
and
 
routes
 
to
 
the
 
external
 
advertiser's
 
landing
 
page.
 
6.  Performance  tracked  in  Analytics.  
7.6  Publisher  Credibility  Veriﬁcation  Flow  
Actors :  User  (Any  Tier)  →  Publisher  Proﬁler  Agent   
Purpose :  Enforce  transparency  and  crowdsource  the  mitigation  of  media  bias  and  
misinformation.
 
Key  steps:  
1.  Inspection :  A  user  views  a  newly  published  card  and  clicks  the  Publisher  Badge  in  
the
 
metadata
 
line.
 
2.  Review :  A  lightweight  modal  opens  displaying  the  "Establishment  Scorecard,"  
revealing
 
the
 
community's
 
aggregated
 
assessment
 
of
 
the
 
publisher's
 
political
 
leaning
 
and
 
historical
 
objectivity.
 
3.  Classiﬁcation :  A  Registered  User  utilizes  the  "Classify"  Action  Bar  tool  to  log  their  
own
 
rating
 
of
 
the
 
source's
 
bias
 
on
 
this
 
speciﬁc
 
article.
 
4.  Recalculation :  The  Publisher  Proﬁler  Agent  ingests  the  new  rating,  recalculating  
the
 
publisher's
 
overall
 
credibility
 
score
 
in
 
real-time.
 
7.7  Critical  Alert  &  Push  Notiﬁcation  Flow  
Actors :  Sourcing  Agent  →  Telegram  Bot  →  Elite  User   

## Page 39

Purpose :  Deliver  time-critical,  mission-aligned  intelligence  directly  to  the  user's  device  
lock
 
screen.
 
Key  steps:  
1.  Detection :  The  Sourcing  Agent  ingests  an  article  and  ﬂags  it  with  an  
Admin-deﬁned
 
critical
 
tag
 
(e.g.,
 #HealthAlert or  #Urgent).  
2.  Bypass :  The  system  routing  rules  recognize  the  tag,  bypassing  passive  board  
placement.
 
3.  Active  Push:  The  Telegram  Bot  instantly  pushes  a  native  chat  message  to  all  Elite  
Users.
 
The
 
message
 
contains
 
the
 
contracted
 
summary,
 
thumbnail,
 
and
 
inline
 
keyboard
 
buons
 
(Promote,
 
Save,
 
Expand)
 
for
 
immediate
 
interaction
 
without
 
opening
 
the
 
full
 
Mini
 
App.
 
7.8  The  Autonomous  Ingestion  Flow  (Agent  Hand-O)  
Actors :  The  7-Agent  Pipeline   
Purpose :  The  fully  autonomous,  backend  operational  loop  that  translates  raw  internet  
data
 
into
 
intelligent
 
UI
 
Cards
 
without
 
human
 
intervention.
 
Key  steps:  
1.  Detection :  A  new  YouTube  URL  is  published  by  a  whitelisted  entity.  The  Sourcing  
Agent
 
detects
 
and
 
extracts
 
the
 
media.
 
2.  Transcription :  The  Sourcing  Agent  passes  the  audio  track  to  the  Transcriber  Agent  
(Whisper),
 
generating
 
a
 
raw
 
text
 
transcript.
 
3.  Localization :  The  Translator  Agent  detects  the  transcript's  language.  If  it  diers  
from
 
the
 
Hub's
 
default,
 
it
 
translates
 
the
 
entire
 
text
 
block.
 
4.  Summarization :  The  Creative  Agent  ingests  the  text,  writing  the  headline,  crafting  
the
 
150-character
 
byline,
 
and
 
generating
 
the
 
Markdown-formaed
 
expanded
 
summary.
 
5.  Pre - Scoring :  The  Taste  Predictor  Agent  scans  the  summary,  assigning  initial  
sentiment
 
and
 
topic
 
tags
 
(Taste
 
Vectors)
 
to
 
solve
 
the
 
"cold
 
start"
 
problem.
 

## Page 40

6.  Routing :  The  system  evaluates  the  assigned  tags  and  publisher  origin,  mapping  
the
 
ﬁnalized
 
Card
 
to
 
the
 
appropriate
 
Board
 
Archetype
 
based
 
on
 
Admin
 
Routing
 
Rules.
 
7.  Personalization :  Upon  board  load,  the  Rating  Proﬁler  Agent  dynamically  reorders  
the
 
board's
 
presentation
 
layer
 
for
 
each
 
speciﬁc
 
user
 
based
 
on
 
their
 
historical
 
interactions.
 
8.   Non-Functional  Requirements  &  Security  
This  section  deﬁnes  the  system  aributes,  performance  metrics,  and  security  protocols  
required
 
to
 
ensure
 
the
 
Xentara
 
Xentara
 
Framework
 
operates
 
as
 
a
 
scalable,
 
reliable,
 
and
 
secure
 
multi-tenant
 
SaaS
 
platform.
 
8.1    Performance  &  Latency  
To  maintain  the  illusion  of  a  seamless  "live"  intelligence  hub,  the  framework  must  
adhere
 
to
 
strict
 
processing
 
and
 
delivery
 
baselines:
 
●  UI  Responsiveness:  The  Delivery  runtimes  (both  Tier  1  PWA  and  Tier  2  Telegram  
Mini
 
App)
 
must
 
achieve
 
an
 
initial
 
Time-to-Interactive
 
(TTI)
 
of
 
under
 
2.0
 
seconds
 
on
 
standard
 
mobile
 
broadband
 
(4G/LTE).
 
●  Search  &  Filter  Latency:  Global  search  queries,  faceted  metadata  ﬁltering,  and  
"Refresh"
 
actions
 
must
 
return
 
populated
 
results
 
in
 
under
 
500
 
milliseconds
 
to
 
ensure
 
the
 
UI
 
feels
 
instantaneous.
 
●  Agentic  Processing  Timelines:  *  Text-Based  Content:  Standard  text  articles  or  RSS  
pulls
 
must
 
be
 
ingested,
 
summarized
 
(Creative
 
Agent),
 
scored
 
(Taste
 
Predictor),
 
and
 
published
 
to
 
the
 
active
 
boards
 
within
 
2
 
minutes
 
of
 
detection.
 
○  Audio/Visual  Content:  Video  or  podcast  sources  requiring  the  Transcriber  Agent  
(e.g.,
 
Whisper)
 
must
 
be
 
processed
 
and
 
published
 
within
 
10
 
minutes
 
of
 
detection,
 
depending
 
on
 
the
 
source
 
media's
 
length.
 
●  Push  Notiﬁcation  Delivery:  Critical  tag  alerts  (e.g.,  #HealthAlert)  routed  via  the  
Telegram
 
bot
 
must
 
be
 
delivered
 
to
 
Elite
 
Users
 
within
 
30
 
seconds
 
of
 
the
 
card
 
passing
 
the
 
ingestion
 
pipeline.
 

## Page 41

8.2  Scalability  &  Concurrency  
As  a  multi-tenant  environment  hosting  numerous  autonomous  Hubs,  the  underlying  
architecture
 
must
 
scale
 
dynamically
 
without
 
suering
 
from
 
"noisy
 
neighbor"
 
degradation.
 
●  Hub  Concurrency:  The  framework  database  and  agentic  pipeline  must  
independently
 
partition
 
and
 
scale
 
to
 
support
 
thousands
 
of
 
simultaneous
 
Hubs
 
without
 
cross-tenant
 
performance
 
drops.
 
●  User  Concurrency:  The  Delivery  runtimes  must  support  a  baseline  of  10,000  
concurrent
 
active
 
users
 
per
 
Hub
 
without
 
noticeable
 
degradation
 
in
 
feed
 
scrolling
 
or
 
Action
 
Bar
 
interactions.
 
●  Agent  Queueing  &  API  Rate  Limiting:  The  Sentrix  Pipeline  must  implement  an  
intelligent
 
queuing
 
mechanism.
 
If
 
upstream
 
LLM
 
providers
 
(e.g.,
 
OpenAI,
 
Anthropic)
 
enforce
 
rate
 
limits,
 
the
 
pipeline
 
must
 
pool
 
and
 
throle
 
ingestion
 
requests
 
automatically
 
rather
 
than
 
dropping
 
data.
 
8.3  Availability  &  Resilience  
●  Uptime  Target:  The  Tier  1  and  Tier  2  Delivery  runtimes,  alongside  the  core  Board  
database,
 
must
 
maintain
 
a
 
99.9%
 
high-availability
 
uptime
 
SLA.
 
●  Graceful  Degradation  (Agent  Failure):  The  framework  must  decouple  the  Delivery  
layer
 
from
 
the
 
Intelligence
 
layer.
 
If
 
the
 
Agentic
 
Pipeline
 
goes
 
oine
 
(e.g.,
 
a
 
third-party
 
LLM
 
outage),
 
the
 
user-facing
 
Hubs
 
must
 
remain
 
fully
 
operational.
 
Users
 
must
 
still
 
be
 
able
 
to
 
browse,
 
read,
 
and
 
search
 
previously
 
processed
 
cards,
 
while
 
new
 
ingestions
 
are
 
safely
 
queued
 
in
 
the
 
background
 
until
 
the
 
pipeline
 
is
 
restored.
 
●  Disaster  Recovery:  Automated  daily  backups  of  all  Hub  conﬁgurations,  Publisher  
Scorecards,
 
and
 
User
 
Taste
 
Graphs
 
must
 
be
 
maintained,
 
with
 
a
 
maximum
 
Recovery
 
Point
 
Objective
 
(RPO)
 
of
 
24
 
hours.
 
8.4  Security,  Privacy  &  Data  Isolation  
Because  the  framework  processes  personal  interaction  data  and  proprietary  
community
 
sentiment,
 
strict
 
data
 
governance
 
is
 
mandatory.
 

## Page 42

●  Tenant  &  Vector  Isolation:  Hubs  operate  in  strictly  siloed  logical  workspaces.  Under  
no
 
circumstances
 
can
 
the
 
Taste
 
Graph
 
vectors,
 
Publisher
 
Scorecards,
 
or
 
user
 
data
 
from
 
Hub
 
A
 
bleed
 
into
 
or
 
inﬂuence
 
the
 
AI
 
algorithms
 
of
 
Hub
 
B
.
 
●  Authentication  Security:  User  authentication  is  handled  strictly  via  secure  OAuth  
2.0/SSO
 
providers
 
(e.g.,
 
Google
 
Auth)
 
or
 
native
 
Telegram
 
identity
 
tokens.
 
The
 
framework
 
will
 
not
 
store
 
native
 
user
 
passwords.
 
●  RAG  Webhook  Encryption:  For  Elite  Users  utilizing  the  "Add  to  RAG"  tool,  all  
external
 
Webhook
 
URLs
 
and
 
Authorization
 
Headers
 
(API
 
Keys)
 
must
 
be
 
stored
 
using
 
AES-256
 
encryption
 
at
 
rest.
 
●  Data  Ownership  &  Portability  (No  Lock-In):  The  Hub  Administrator  retains  full  
ownership
 
of
 
their
 
community's
 
generated
 
intelligence.
 
The
 
Admin
 
Console
 
must
 
provide
 
a
 
one-click
 
"Data
 
Export"
 
tool
 
allowing
 
the
 
Custodian
 
to
 
download
 
their
 
community's
 
Publisher
 
Scorecards,
 
structured
 
Board
 
schemas,
 
and
 
aggregated
 
Taste
 
Graph
 
metrics
 
in
 
a
 
standardized
 
format
 
(JSON/CSV)
 
at
 
any
 
time.
 
 
9.  Entity  Relationship  Diagram  (Derived  from  Semantic  Model)  
9.1  Multi-Tenancy  &  Infrastructure  
●  HUB:  The  core  tenant  entity.  Stores  the  community  name,  custom  domain,  default  
language,
 
visual
 
branding,
 
and
 
Admin
 
conﬁguration
 
seings.
 
9.2  Identity  &  Access  Management  (IAM)  
●  USER:  The  global  identity  of  a  person  across  the  entire  Xentara  Xentara  platform.  Stores  
Google
 
Auth
 
ID,
 
Telegram
 
ID,
 
global
 
email,
 
and
 
base
 
proﬁle
 
data.
 ●  HUB_MEMBERSHIP:  A  linking  table  between  USER and  HUB.  Stores  the  user’s  speciﬁc  
role
 
in
 
that
 
speciﬁc
 
Hub
 
(e.g.,
 
Administrator,
 
Elite,
 
Registered),
 
their
 
billing
 
status,
 
and
 
local
 
proﬁle
 
bio.
 ●  USER_INTEGRATION:  Stores  the  Elite  user's  webhook  conﬁgurations  (e.g.,  the  target  
URL
 
and
 
encrypted
 
API
 
key
 
for
 
the
 
"Add
 
to
 
RAG"
 
tool).
 

## Page 43

9.3  Source  Management  &  Credibility  (The  "Where")  
●  PUBLISHER:  The  external  media  entity  (e.g.,  "The  New  York  Times",  "Marques  
Brownlee").
 ●  MONITORED_SOURCE:  The  speciﬁc  endpoints  the  Sourcing  Agent  watches.  Links  to  a  PUBLISHER and  a  HUB.  (e.g.,  Source  Type:  "YouTube  Channel",  URL:  "youtube.com/c/mkbhd").  Includes  agent  toggles  (e.g.,  Transcriber  =  ON).  ●  ESTABLISHMENT_SCORECARD:  Stores  the  aggregated,  dynamically  calculated  
credibility
 
metrics
 
for
 
a
 PUBLISHER within  a  speciﬁc  HUB (e.g.,  Objectivity  Score,  
Political
 
Leaning
 
index).
 
9.4  Content  &  Agent  Outputs  (The  "What")  
●  RAW_INGESTION:  The  raw  data  pulled  by  the  agents  before  it  becomes  a  card.  Stores  
original
 
URLs,
 
Whisper
 
transcripts,
 
and
 
raw
 
translated
 
text.
 ●  CARD:  The  central  content  entity  (replacing  your  idea  of  POST/ENTRY).  Stores  the  
ﬁnalized
 
Markdown
 
summary,
 
the
 
contracted
 
headline,
 
thumbnail
 
URL,
 
and
 
Card
 
Archetype
 
(Narrative,
 
Chronological,
 
Entity,
 
Transactional).
 ●  CARD_METADATA:  A  child  table  of  CARD storing  archetype-speciﬁc  data  (e.g.,  start_date and  location for  Chronological  cards,  or  price for  Transactional  
cards).
 ●  TAG:  The  system-wide  list  of  Taste  Vectors  and  topics  (e.g.,  #HealthAlert,  #Neutral,  #HighlyTechnical).  ●  CARD_TAG:  A  many-to-many  linking  table  associating  multiple  TAGs to  a  speciﬁc  CARD.  
9.5  Topology  &  Routing  (The  "Where  To")  
●  BOARD:  A  speciﬁc  page  within  a  Hub.  Stores  the  Board  Name,  UI  Archetype  (Calendar,  
Feed,
 
Registry),
 
and
 
active
 
Action
 
Bar
 
toggles
 
(e.g.,
 
"Comments
 
Enabled
 
=
 
True").
 ●  ROUTING_RULE:  The  Admin-deﬁned  logic  that  tells  the  system  how  to  populate  a  BOARD.  Evaluates  TAGs or  PUBLISHER_IDs to  auto-route  cards  to  the  correct  board.  ●  BOARD_CARD_MAPPING:  While  standard  feeds  might  be  populated  dynamically  via  
routing
 
rules,
 
this
 
table
 
explicitly
 
tracks
 
cards
 
pinned,
 
manually
 
moved,
 
or
 
submied
 
to
 
speciﬁc
 
boards.
 

## Page 44

9.6  User  Engagement  &  The  Taste  Graph  
●  TASTE_PROFILE:  A  mathematical  vector  representation  of  a  user’s  preferences  within  
a
 
speciﬁc
 
Hub,
 
updated
 
dynamically
 
by
 
the
 
Rating
 
Proﬁler
 
agent.
 ●  INTERACTION:  Logs  every  user  action  on  a  CARD.  Stores  Interaction  Type  (Clap,  Save,  
Read,
 
Show
 
Less),
 
Timestamp,
 
and
 
the
 
associated
 USER_ID and  CARD_ID.  ●  CREDIBILITY_RATING:  Explicit  user  votes  submied  via  the  "Classify"  tool.  Tracks  
how
 
a
 
speciﬁc
 
user
 
rated
 
a
 
speciﬁc
 
card's
 
bias/objectivity
 
(which
 
the
 
agents
 
use
 
to
 
update
 
the
 ESTABLISHMENT_SCORECARD).  ●  COMMENT:  User  discourse  aached  to  a  speciﬁc  CARD.  ●  USER_SUBMISSION:  Content  submied  via  Telegram/WhatsApp  by  Elite  users,  siing  
in
 
the
 
Admin's
 
Curation
 
Inbox
 
awaiting
 
approval.
 
9.7  Monetization  &  Outbound  Routing  
●  AD_CAMPAIGN:  Admin-created  conﬁgurations  for  Sponsored  placements.  Stores  
targeting
 
rules
 
(Target
 
Tags),
 
injection
 
ratios,
 
and
 
active
 
dates.
 ●  SPONSORED_CARD:  The  actual  advertisement  payload  (inheriting  from  the  CARD 
structure
 
but
 
marked
 
as
 
sponsored).
 ●  OUTBOUND_WEBHOOK:  Admin  rules  for  the  Social  Syndication  feature.  Stores  external  
API
 
keys
 
(e.g.,
 
X,
 
WhatsApp
 
Channel)
 
and
 
the
 
trigger
 
conditions
 
(e.g.,
 
Tag
 
=
 #Breaki  
 
 
 
Appendix  A:  Tier  2  Runtime  (Telegram  Bot  &  Mini  App  Integration)  
A.1  Overview  The  Xentara  Xentara  Framework  utilizes  a  dual-runtime  architecture.  While  the  
Tier
 
1
 
Runtime
 
(PWA/Browser)
 
serves
 
as
 
the
 
top-of-funnel
 
acquisition
 
and
 
standard
 
consumption
 
layer,
 
the
 
Tier
 
2
 
Runtime
 
leverages
 
the
 
Telegram
 
ecosystem
 
to
 
provide
 
Elite
 
Users
 
(Subscribers)
 
with
 
a
 
frictionless,
 
high-retention
 
mobile
 
experience.
 
This
 
Tier
 
2
 

## Page 45

environment  is  strictly  composed  of  two  interconnected  components:  the  Conversational  
Bot
 
and
 
the
 
native
 
Telegram
 
Mini
 
App
 
(TMA).
 
A.2  The  Bot  Component  (Push  &  Ingestion)  The  Telegram  Bot  acts  as  the  asynchronous  
communication
 
bridge
 
between
 
the
 
Xentara
 
Xentara
 
backend
 
and
 
the
 
Elite
 
User.
 
●  Authentication  Handshake:  Registration  is  initiated  via  a  securely  signed  "Magic  
Deep
 
Link"
 
generated
 
in
 
the
 
Tier
 
1
 
PWA.
 
Clicking
 
this
 
link
 
launches
 
the
 
Telegram
 
app
 
and
 
passes
 
a
 
unique
 
authentication
 
token
 
(/start=auth_[token]),  permanently  
mapping
 
the
 
user's
 
web
 
identity
 
to
 
their
 
native
 
Telegram
 
User
 
ID.
 ●  Active  Push  Delivery:  Bypassing  algorithmic  social  media  suppression,  the  bot  
delivers
 
native
 
chat
 
messages
 
for
 
critical
 
content.
 
Governed
 
by
 
the
 
Admin's
 
Routing
 
Rules,
 
any
 
card
 
tagged
 
with
 
high-priority
 
metadata
 
(e.g.,
 #BreakingNews or  #HealthAlert)  is  immediately  pushed  to  the  user's  Telegram  chat  thread.  ●  Inline  Interaction:  Push  alerts  delivered  into  the  chat  thread  utilize  Telegram’s  Inline  
Keyboard.
 
This
 
allows
 
users
 
to
 
trigger
 
lightweight
 
Action
 
Bar
 
commands
 
(e.g.,
 
"Expand
 
Summary"
 
or
 
"Save
 
to
 
Proﬁle")
 
directly
 
within
 
the
 
chat
 
bubble
 
without
 
launching
 
the
 
full
 
visual
 
interface.
 ●  Decentralized  Curation  (Ingestion):  Elite  Users  can  utilize  the  bot  as  a  direct  
ingestion
 
tool.
 
By
 
forwarding
 
an
 
external
 
URL,
 
article,
 
or
 
text
 
payload
 
to
 
the
 
bot,
 
the
 
submission
 
is
 
automatically
 
routed
 
to
 
the
 
Hub's
 
Curation
 
Inbox
 
for
 
Admin
 
approval,
 
eectively
 
crowdsourcing
 
content
 
discovery.
 
A.3  The  Telegram  Mini  App  Component  (The  Visual  Runtime)  The  Telegram  Mini  App  
(TMA)
 
provides
 
the
 
full
 
graphical
 
user
 
interface
 
of
 
the
 
Hub,
 
operating
 
as
 
a
 
slide-up
 
web-view
 
securely
 
sandboxed
 
within
 
the
 
native
 
Telegram
 
mobile
 
application.
 
●  Launch  Mechanism:  The  TMA  is  launched  via  a  persistent,  visually  distinct  "Menu  
Buon"
 
(e.g.,
 
"Open
 
Hub"
 
or
 
"View
 
Boards")
 
anchored
 
at
 
the
 
boom
 
of
 
the
 
Bot’s
 
chat
 
interface.
 ●  Feature  Parity:  The  TMA  perfectly  mirrors  the  capabilities  of  the  Tier  1  PWA.  It  renders  
the
 
full
 
Polymorphic
 
Board
 
Architecture,
 
allowing
 
the
 
user
 
to
 
seamlessly
 
scroll
 
the
 
contracted
 
feed,
 
view
 
Entity
 
Registries,
 
and
 
utilize
 
the
 
complete
 
Action
 
Bar
 
(Promote,
 
Classify,
 
Comment).
 

## Page 46

●  Session  Management  &  State  Sync:  Because  authentication  is  managed  natively  by  
Telegram’s
 
platform
 
tokens
 
upon
 
launch,
 
Elite
 
Users
 
never
 
need
 
to
 
manually
 
log
 
in
 
to
 
the
 
Mini
 
App.
 
Furthermore,
 
all
 
interactions
 
(Claps,
 
Saves,
 
Proﬁle
 
updates)
 
made
 
within
 
the
 
TMA
 
instantly
 
sync
 
with
 
the
 
central
 
database,
 
dynamically
 
updating
 
the
 
user's
 
central
 
Taste
 
Graph
 
in
 
real-time.
 
 
Key  Dierences  from  Telegram  Runtime  (Elite  Tier)  
 Aspect  PWA  (Standard  Browser  Hub)  Telegram  Mini  App  (Elite  Runtime)  
 Access  Any  browser  (URL  or  installed  icon)  Inside  Telegram  (bot/chat  list)  
 Push  Notiﬁcations  Web  push  (requires  permission)  Native  Telegram  push  (100%  reliable)  
 Oine  Partial  (cached  content)  Stronger  caching  +  Telegram  oine  queues  
 Onboarding  Friction  Google  Auth  →  optional  Telegram  link  Instant  after  linking  
 Primary  Strength  SEO,  guest  discovery,  desktop  experience  Mobile-ﬁrst,  alerts,  zero-download  install  
 Interaction  Style  Full-page  web  UI,  grid/list  views  Chat-embedded,  inline  keyboards,  slide-ups  
 In  essence,  the  PWA  is  the  open  door  to  the  Xentara  Xentara  ecosystem—optimized  for  
broad
 
reach,
 
easy
 
onboarding,
 
and
 
a
 
rich,
 
visual
 
browsing
 
experience—while
 
seamlessly
 
funneling
 
engaged
 
users
 
toward
 
the
 
Telegram
 
premium
 
layer
 
for
 
deeper,
 
always-on
 
intelligence.
 
 Appendix  B:  Agentic  System  Integration  
The  platform’s  agents  perform  three  main  roles.  

## Page 47

1  Source  Monitoring  Agents  
Watch  sources  like:  
●  Facebook  
●  Instagram  
●  X  
●  Wikipedia  
●  YouTube  
●  Reddit  
●  Quora  
 
Agents  detect  new  items.  
 
2  Card  Generation  Agents  
Agents:  
1.  read  content  
2.  summarize  
3.  generate  card  title  
4.  generate  thumbnail  
5.  tag  topic  
6.  assign  board  
7.  determine  ranking  score  
 
Card  example:  
Card  ID  
Title  

## Page 48

Summary  
Thumbnail  
Board  
Source  URL  
Publish  Time  
Expiry  Time  
Ranking  Score  
 
3  Ranking  /  Recommendation  Agents  
Use:  
●  user  ratings  
●  similarity  between  users  
●  topic  ainity  
 
Example  algorithm:  
User  vector  =  topics  +  ratings  
Content  vector  =  tags  +  source  reputation  
 
Recommendation  score  =  
cosine_similarity(user,content)  
 
8.  Paid  Placement  Cards  
Advertisers  submit  campaigns  through  the  admin  console.  
Ad  card  example:  
Sponsored  

## Page 49

AI  Bootcamp  for  Developers  
Become  job-ready  in  12  weeks.  
 
[Learn  More]  
Rules:  
Board:  Opportunities  
Duration:  7  days  
Frequency:  every  10  cards  
Geo-target:  South  Africa  
The  ranking  engine  injects  them  into  feeds.  
 
9.  Subscriber  Proﬁles  
Proﬁle  contains:  
User  ID  
Display  name  
Message  /  bio  
Topic  interests  
Source  preferences  
Ratings  history  
Reputation  score  
The  rating  proﬁler  agent  builds:  
User  preference  vectors  
Cluster  of  similar  users  
Trust  score  
Inﬂuence  score  

## Page 50

This  enables  collaborative  ﬁltering .  
 
10.  Browser  Version  vs  Telegram  Version  
Browser  version  behaves  more  like  a  visual  dashboard .  
Boards  
 
News  |  Opportunities  |  Events  |  Notiﬁcations  
 
Card  grid  layout  
Cards  expand  inline.  
Telegram  version  is  message-based  navigation .  
 
11.  Why  Telegram  Is  Brilliant  for  This  
Telegram  gives  you:  
●  push  notiﬁcations  
●  chat  UI  
●  bot  automation  
●  identity  
●  global  distribution  
●  zero  mobile  app  maintenance  
 
Essentially  Telegram  becomes  your  mobile  runtime  environment .  
 
12.  A  Very  Powerful  Extension  (Future)  
Your  boards  could  also  become  public  intelligence  channels .  

## Page 51

Example:  
African  Tech  Radar  
SME  Opportunities  
AI  Research  Feed  
Startup  Funding  Alerts  
Communities  subscribe  to  them  globally.  
 
 
 
APPENDIX
 
C
:  
Public
 
Product
 
Marketing
 
Website
 
The  public-facing  Xentara  Xentara  website  serves  strictly  as  the  marketing  and  conversion  
portal
 
for
 
the
 
framework
 
itself.
 
Its
 
primary
 
target
 
audience
 
is
 
prospective
 
Community
 
Custodians
.
 
It
 
is
 
distinctly
 
separate
 
from
 
the
 
actual
 
community
 
Hubs
 
(the
 
various
 
PWAs
 
and
 
Telegram
 
Mini
 
Apps
 
created
 
using
 
the
 
framework)
 
and
 
the
 
Admin
 
Console.
 
Its
 
sole
 
purpose
 
is
 
to
 
act
 
as
 
a
 
narrative
 
funnel:
 
to
 
educate
 
visitors
 
on
 
the
 
value
 
of
 
the
 
agentic
 
framework,
 
demonstrate
 
its
 
capabilities,
 
and
 
convert
 
them
 
into
 
platform
 
administrators
 
who
 
sign
 
up
 
to
 
deploy
 
their
 
own
 
bespoke
 
Xentara
 
Xentara
 
Hubs.
 
When  this  public-facing  website  is  created,  the  following  guidelines  and  instructions  that  is  
provided
 
in
 
the
 
“Web
 
Site/App
 
Design
 
Guidelines”
 
document
 
must
 
be
 
followed;
 
said
 
document
 
can
 
be
 
viewed
 
here:
 hps://docs.google.com/document/d/1PKhHVvjYx7z2LNmfk-JkfosObsZRZTVFn8C81RYOVVA/edit?tab=t.0#heading=h.vrf4khtgogfz  
Design  Draft  
1.  The  Hero  Section  (The  "Qualiﬁed  Filter")  

## Page 52

This  section  must  pass  the  "XY  Test"  within  5  seconds,  explicitly  naming  the  audience  
(Community
 
Custodians),
 
the
 
outcome
 
(bespoke
 
intelligence
 
hubs),
 
and
 
the
 
mechanism
 
(agentic
 
framework).
 
●  H1  (The  Value  Prop):  The  Agentic  Intelligence  Hub  for  Your  Community.  
●  H2  (The  How):  Replace  chaotic  group  chats  and  static  newsleers  with  a  
programmable
 
engine.
 
Xentara
 
Xentara
 
autonomously
 
sources,
 
summarizes,
 
and
 
vets
 
content
 
for
 
your
 
niche
 
audience—delivered
 
natively
 
via
 
Telegram
 
and
 
the
 
Web.
 
●  Primary  CTA:  Build  Your  Hub  (Free  Hobby  Tier)  —  Low  friction,  instant  gratiﬁcation.  
●  Secondary  CTA:  Explore  a  Live  Pulse  —  Interactive  demo  instead  of  a  sales  call.  
●  Visual:  A  split-screen  mockup.  Left  side:  The  clean  PWA  interface.  Right  side:  The  
slide-up
 
Telegram
 
Mini
 
App
 
(TMA)
 
showing
 
an
 
expanded
 
card.
 
No
 
people
 
shaking
 
hands.
 
2.  Problem  /  Solution  ("The  Aha!  Moment")  
A  brief  section  validating  the  pain  of  information  overload,  leading  directly  to  your  solution.  
●  Heading:  Signal,  not  noise.  
●  Copy:  Stop  forcing  your  community  to  dig  through  unstructured  social  feeds  or  
download
 
clunky
 
mobile
 
apps.
 
Xentara
 
Xentara
 
provides
 
a
 
mission-led
 
ﬁlter
 
powered
 
by
 
AI
 
and
 
peer-review.
 
●  Visual:  A  simple  "Before  &  After"  diagram.  
○  Before:  A  messy  web  of  YouTube,  X,  and  RSS  feeds  pointing  to  a  confused  user.  
○  After:  The  same  feeds  passing  through  the  "Xentara  Pipeline"  into  clean,  
categorized
 
boards.
 
3.  Core  Capabilities  (The  "Pill"  System)  
Instead  of  long  descriptions,  we  use  scannable  "pills"  with  icons  to  explain  the  technical  
moat.
 
●  Heading:  A  full  digital  newsroom  on  autopilot.  
●  Pills  (Grid  Layout):  

## Page 53

○  🤖  7-Agent  Pipeline:  Autonomous  sourcing,  video  transcription  (Whisper),  
and
 
translation.
 
○  📱  Zero  App  Development:  Your  hub  lives  natively  inside  Telegram  as  an  
interactive
 
Mini
 
App.
 
100%
 
push
 
notiﬁcation
 
reach.
 
○  🧠  Predictive  Taste  Graph:  The  engine  pre-ranks  content  sentiment  before  
anyone
 
even
 
reads
 
it,
 
solving
 
the
 
"cold
 
start"
 
problem.
 
○  🛡  Publisher  Veing:  A  built-in  "Establishment  Scorecard"  tracks  media  
objectivity
 
and
 
political
 
leaning
 
based
 
on
 
community
 
ratings.
 
○  🗂  Multi-Board  Architecture:  Conﬁgure  up  to  10  distinct  feeds  for  News,  
Opportunities,
 
Events,
 
and
 
more.
 
4.  Pricing  &  Friction  Reduction  
To  adhere  to  the  "Orange  Flag"  rule,  we  skip  the  desperate  "30-day  money-back  guarantee"  
and
 
instead
 
rely
 
on
 
a
 
generous
 
Hobby
 
Tier
 
and
 
a
 
"No
 
Lock-In"
 
clause.
 
●  Heading:  Start  curating  immediately.  
●  Pricing  Cards:  
○  Hobby  (Free):  Up  to  2  Public  Boards,  Standard  PWA  Runtime,  Basic  
Summarization.
 
○  Elite  Hub  (Paid):  10  Conﬁgurable  Boards,  Telegram  Native  Runtime  (TMA),  Full  
Agentic
 
Suite
 
(Transcribe/Translate),
 
Advertiser
 
Console.
 
●  Trust  Micro-copy  (Under  the  CTA):  Your  data  is  yours.  Export  your  community's  
Taste
 
Graph
 
and
 
publisher
 
ratings
 
at
 
any
 
time.
 
Cancel
 
or
 
downgrade
 
to
 
Hobby
 
seamlessly.
 
5.  Footer  (Utility  Layer)  
Keep  it  disciplined  and  clean.  
●  Community  Custodian  Login  
●  Admin  Console  Documentation  
●  Terms  of  Service  &  Privacy  
●  Contact  

## Page 54

 
 
 

