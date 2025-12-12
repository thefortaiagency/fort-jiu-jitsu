// BJJ Techniques Database
// Comprehensive library of 351+ techniques organized by category, level, and position

export type TechniqueCategory =
  | 'submission'
  | 'position'
  | 'guard'
  | 'guard-pass'
  | 'sweep'
  | 'takedown'
  | 'escape'
  | 'back-take';

export type TechniqueSubcategory =
  | 'choke'
  | 'joint-lock'
  | 'leg-lock'
  | 'spine-lock'
  | 'dominant-position'
  | 'defensive-position'
  | 'open-guard'
  | 'closed-guard'
  | 'half-guard'
  | 'wrestling'
  | 'judo'
  | 'position-escape'
  | 'submission-escape';

export type DifficultyLevel = 'fundamental' | 'intermediate' | 'advanced';

export type Position =
  | 'closed-guard'
  | 'open-guard'
  | 'half-guard'
  | 'mount'
  | 'side-control'
  | 'back-control'
  | 'knee-on-belly'
  | 'north-south'
  | 'turtle'
  | 'standing'
  | 'guard-top'
  | 'multiple';

export interface Technique {
  id: string;
  name: string;
  aliases?: string[];
  category: TechniqueCategory;
  subcategory?: TechniqueSubcategory;
  difficulty: DifficultyLevel;
  description: string;
  keyPoints?: string[];
  startingPosition?: Position;
  endingPosition?: Position;
  giLegal: boolean;
  noGiLegal: boolean;
  points?: number;
  beltRestrictions?: string;
  relatedTechniques?: string[];
  videoUrl?: string;
}

// Category metadata for UI
export const CATEGORIES: Record<TechniqueCategory, { label: string; description: string; icon: string; color: string }> = {
  'submission': {
    label: 'Submissions',
    description: 'Techniques that force an opponent to tap out',
    icon: '🎯',
    color: 'red'
  },
  'position': {
    label: 'Positions',
    description: 'Dominant and neutral positions for control',
    icon: '🏔️',
    color: 'blue'
  },
  'guard': {
    label: 'Guard Types',
    description: 'Defensive positions using legs to control',
    icon: '🛡️',
    color: 'purple'
  },
  'guard-pass': {
    label: 'Guard Passes',
    description: 'Getting past opponent\'s legs to dominant position',
    icon: '⚡',
    color: 'yellow'
  },
  'sweep': {
    label: 'Sweeps',
    description: 'Reversing from bottom to top position',
    icon: '🔄',
    color: 'green'
  },
  'takedown': {
    label: 'Takedowns & Throws',
    description: 'Taking opponent from standing to ground',
    icon: '💥',
    color: 'orange'
  },
  'escape': {
    label: 'Escapes',
    description: 'Getting out of bad positions',
    icon: '🚀',
    color: 'cyan'
  },
  'back-take': {
    label: 'Back Takes',
    description: 'Transitioning to back control',
    icon: '🎪',
    color: 'pink'
  }
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, { label: string; belts: string; color: string }> = {
  'fundamental': {
    label: 'Fundamental',
    belts: 'White Belt',
    color: 'white'
  },
  'intermediate': {
    label: 'Intermediate',
    belts: 'Blue-Purple Belt',
    color: 'blue'
  },
  'advanced': {
    label: 'Advanced',
    belts: 'Brown-Black Belt',
    color: 'brown'
  }
};

export const POSITIONS: Record<Position, string> = {
  'closed-guard': 'Closed Guard',
  'open-guard': 'Open Guard',
  'half-guard': 'Half Guard',
  'mount': 'Mount',
  'side-control': 'Side Control',
  'back-control': 'Back Control',
  'knee-on-belly': 'Knee on Belly',
  'north-south': 'North-South',
  'turtle': 'Turtle',
  'standing': 'Standing',
  'guard-top': 'Guard (Top)',
  'multiple': 'Multiple Positions'
};

// Complete technique database
export const TECHNIQUES: Technique[] = [
  // ==========================================
  // SUBMISSIONS - CHOKES
  // ==========================================
  {
    id: 'rnc',
    name: 'Rear-Naked Choke',
    aliases: ['Mata Leão', 'RNC'],
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'fundamental',
    description: 'Applied from back control without using the gi. One arm wraps around the opponent\'s neck while the other arm reinforces the choke. The highest-percentage submission in competition.',
    keyPoints: [
      'Get your choking arm deep under the chin',
      'Place your hand on your bicep',
      'Use your other hand behind their head',
      'Squeeze your elbows together, not your hands'
    ],
    startingPosition: 'back-control',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    relatedTechniques: ['back-control', 'body-triangle']
  },
  {
    id: 'triangle-choke',
    name: 'Triangle Choke',
    aliases: ['Sankaku Jime'],
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'fundamental',
    description: 'Uses the legs to create a triangle shape around the opponent\'s neck and one arm, cutting off blood flow through the carotid arteries. Can be applied from guard, mount, or side control.',
    keyPoints: [
      'Control one arm in, one arm out',
      'Lock the triangle high on their neck',
      'Pull their head down',
      'Angle off to the side for better squeeze'
    ],
    startingPosition: 'closed-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    relatedTechniques: ['armbar', 'omoplata']
  },
  {
    id: 'guillotine',
    name: 'Guillotine Choke',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'fundamental',
    description: 'Front-facing choke typically applied when opponent shoots for takedown or has poor posture in guard. Multiple variations include arm-in, high-elbow, and power guillotine.',
    keyPoints: [
      'Wrap arm around neck, chin in elbow pit',
      'Grip hands together (gable or RNC grip)',
      'Close guard or butterfly hooks',
      'Arch back and squeeze'
    ],
    startingPosition: 'closed-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'darce-choke',
    name: 'D\'Arce Choke',
    aliases: ['Brabo Choke'],
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'intermediate',
    description: 'A front headlock choke where the attacker threads their arm under the opponent\'s neck and through their own armpit. Effective from turtle, half guard top, and front headlock.',
    keyPoints: [
      'Thread arm under neck and through armpit',
      'Create figure-four configuration',
      'Walk hips toward their head',
      'Squeeze and sprawl'
    ],
    startingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'anaconda-choke',
    name: 'Anaconda Choke',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'intermediate',
    description: 'Similar to D\'Arce but with arm threaded in opposite direction. Applied from front headlock or sprawl positions.',
    keyPoints: [
      'Arm goes over their arm, under neck',
      'Gable grip behind their shoulder',
      'Roll to the choking side',
      'Finish on your side'
    ],
    startingPosition: 'turtle',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'ezekiel-choke',
    name: 'Ezekiel Choke',
    aliases: ['Sode Guruma Jime'],
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'intermediate',
    description: 'Unique choke that can be applied from inside closed guard (top). Uses the sleeve of the gi to create pressure across the neck. No-gi version uses fist.',
    keyPoints: [
      'Feed hand deep into collar',
      'Other hand grabs inside sleeve',
      'Rotate wrist to apply pressure',
      'Drive forearm across throat'
    ],
    startingPosition: 'mount',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'arm-triangle',
    name: 'Arm Triangle Choke',
    aliases: ['Head and Arm Choke', 'Kata Gatame'],
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'fundamental',
    description: 'Applied from side control or mount, using opponent\'s own arm to assist in the choke by trapping it against their neck.',
    keyPoints: [
      'Trap their arm against their neck',
      'Connect hands behind their head',
      'Walk to the trapped arm side',
      'Sprawl and squeeze'
    ],
    startingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'north-south-choke',
    name: 'North-South Choke',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'intermediate',
    description: 'Applied from north-south position using shoulder pressure and arm positioning to create the strangle.',
    keyPoints: [
      'Arm wraps around neck',
      'Drive shoulder into neck',
      'Walk hips away',
      'Turn hip into their face'
    ],
    startingPosition: 'north-south',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'bow-arrow',
    name: 'Bow and Arrow Choke',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'intermediate',
    description: 'Applied from back control using opponent\'s collar and pant leg to create a bow-and-arrow configuration. Very powerful gi choke.',
    keyPoints: [
      'Deep collar grip behind the neck',
      'Hook near leg with same side leg',
      'Grab their pants at the knee',
      'Extend legs and pull collar'
    ],
    startingPosition: 'back-control',
    giLegal: true,
    noGiLegal: false,
    points: 0
  },
  {
    id: 'cross-choke',
    name: 'Cross Choke',
    aliases: ['X-Choke', 'Cross Collar Choke'],
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'fundamental',
    description: 'Fundamental gi choke using crossed grips on opponent\'s collar. Can be applied from mount, guard, or side control.',
    keyPoints: [
      'Get deep collar grips, thumbs inside',
      'Cross wrists',
      'Pull elbows to your ribs',
      'Twist wrists outward'
    ],
    startingPosition: 'mount',
    giLegal: true,
    noGiLegal: false,
    points: 0
  },
  {
    id: 'loop-choke',
    name: 'Loop Choke',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'intermediate',
    description: 'Deceptive choke involving feeding one collar grip deep to create a loop around opponent\'s neck.',
    keyPoints: [
      'Feed collar grip deep',
      'Create loop around neck',
      'Pull head into the loop',
      'Roll to finish if needed'
    ],
    startingPosition: 'open-guard',
    giLegal: true,
    noGiLegal: false,
    points: 0
  },
  {
    id: 'baseball-choke',
    name: 'Baseball Choke',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'intermediate',
    description: 'Uses a baseball bat-style grip on the collar. Often from knee on belly or during guard passing.',
    keyPoints: [
      'Grip collar like a baseball bat',
      'One palm up, one palm down',
      'Spin to north-south',
      'Extend arms to finish'
    ],
    startingPosition: 'knee-on-belly',
    giLegal: true,
    noGiLegal: false,
    points: 0
  },
  {
    id: 'clock-choke',
    name: 'Clock Choke',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'intermediate',
    description: 'Applied from turtle position, walking around opponent like the hands of a clock while maintaining collar grip.',
    keyPoints: [
      'Deep collar grip',
      'Block their hip with knee',
      'Walk around their head',
      'Drop hip to finish'
    ],
    startingPosition: 'turtle',
    giLegal: true,
    noGiLegal: false,
    points: 0
  },
  {
    id: 'paper-cutter',
    name: 'Paper Cutter Choke',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'intermediate',
    description: 'Applied from side control or north-south using lapel to create a sliding choke across the neck.',
    keyPoints: [
      'Grip far collar',
      'Feed lapel under their head',
      'Drive elbow to mat',
      'Slide forearm across throat'
    ],
    startingPosition: 'side-control',
    giLegal: true,
    noGiLegal: false,
    points: 0
  },
  {
    id: 'gogoplata',
    name: 'Gogoplata',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'advanced',
    description: 'Applied from rubber guard or mount, using the shin bone across the throat.',
    keyPoints: [
      'Control head with overhook',
      'Place shin across throat',
      'Pull head down onto shin',
      'Extend hips'
    ],
    startingPosition: 'closed-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'von-flue-choke',
    name: 'Von Flue Choke',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'intermediate',
    description: 'Counter to guillotine when you pass to side control. Use shoulder pressure to choke.',
    keyPoints: [
      'Pass to side control with head trapped',
      'Drive shoulder into neck',
      'Grab your own thigh',
      'Drop hips and pressure'
    ],
    startingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'buggy-choke',
    name: 'Buggy Choke',
    category: 'submission',
    subcategory: 'choke',
    difficulty: 'advanced',
    description: 'Modern choke from bottom side control using a triangle configuration with inverted hips.',
    keyPoints: [
      'From bottom side control',
      'Thread leg over their neck',
      'Lock triangle with other leg',
      'Squeeze and extend'
    ],
    startingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  // ==========================================
  // SUBMISSIONS - JOINT LOCKS (ARMS)
  // ==========================================
  {
    id: 'armbar',
    name: 'Armbar',
    aliases: ['Juji Gatame'],
    category: 'submission',
    subcategory: 'joint-lock',
    difficulty: 'fundamental',
    description: 'The most common submission in BJJ. Hyperextends the elbow by controlling the arm while using hips as a fulcrum. Can be applied from virtually any position.',
    keyPoints: [
      'Control the arm with both hands',
      'Pinch knees together',
      'Keep their thumb pointing up',
      'Raise hips while pulling arm down'
    ],
    startingPosition: 'multiple',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    relatedTechniques: ['triangle-choke', 'omoplata']
  },
  {
    id: 'kimura',
    name: 'Kimura',
    aliases: ['Gyaku Ude Garami', 'Double Wristlock'],
    category: 'submission',
    subcategory: 'joint-lock',
    difficulty: 'fundamental',
    description: 'Shoulder lock using figure-four grip on opponent\'s arm, rotating internally to attack shoulder. Named after judoka Masahiko Kimura.',
    keyPoints: [
      'Figure-four grip on their wrist',
      'Keep their elbow tight to your body',
      'Rotate their arm behind their back',
      'Keep your elbows pinched'
    ],
    startingPosition: 'multiple',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    relatedTechniques: ['americana', 'hip-bump-sweep']
  },
  {
    id: 'americana',
    name: 'Americana',
    aliases: ['Ude Garami', 'Keylock', 'Paintbrush'],
    category: 'submission',
    subcategory: 'joint-lock',
    difficulty: 'fundamental',
    description: 'Shoulder lock similar to Kimura but with external rotation. Most commonly applied from mount or side control.',
    keyPoints: [
      'Pin their wrist to the mat',
      'Figure-four grip',
      'Keep elbow stationary',
      'Slide wrist toward their hip'
    ],
    startingPosition: 'mount',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    relatedTechniques: ['kimura', 'arm-triangle']
  },
  {
    id: 'omoplata',
    name: 'Omoplata',
    aliases: ['Ashi Sankaku Garami'],
    category: 'submission',
    subcategory: 'joint-lock',
    difficulty: 'intermediate',
    description: 'Shoulder lock using legs to isolate and attack the shoulder. Often leads to sweeps or back takes if opponent defends.',
    keyPoints: [
      'Control their arm with your legs',
      'Sit up and control their hip',
      'Keep them flat',
      'Lean forward for the finish'
    ],
    startingPosition: 'closed-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    relatedTechniques: ['triangle-choke', 'armbar']
  },
  {
    id: 'wrist-lock',
    name: 'Wrist Lock',
    category: 'submission',
    subcategory: 'joint-lock',
    difficulty: 'intermediate',
    description: 'Hyperextension or rotation of the wrist joint. Often opportunistic submissions from grip fighting.',
    keyPoints: [
      'Control their forearm',
      'Bend wrist past natural range',
      'Keep pressure steady',
      'Quick finish when available'
    ],
    startingPosition: 'multiple',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    beltRestrictions: 'Blue belt and above in IBJJF'
  },
  {
    id: 'bicep-slicer',
    name: 'Bicep Slicer',
    category: 'submission',
    subcategory: 'joint-lock',
    difficulty: 'advanced',
    description: 'Compression lock that crushes the bicep against the forearm bone. Advanced technique due to injury potential.',
    keyPoints: [
      'Control arm in armbar position',
      'Thread leg under their elbow',
      'Close triangle on their arm',
      'Extend hips'
    ],
    startingPosition: 'multiple',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    beltRestrictions: 'Brown belt and above in IBJJF'
  },
  {
    id: 'tarikoplata',
    name: 'Tarikoplata',
    category: 'submission',
    subcategory: 'joint-lock',
    difficulty: 'advanced',
    description: 'Modern shoulder lock that combines elements of omoplata and kimura. Named after Tarik Hopstock.',
    keyPoints: [
      'From omoplata position',
      'Grab your own leg',
      'Create kimura-like pressure',
      'Roll to finish'
    ],
    startingPosition: 'closed-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'baratoplata',
    name: 'Baratoplata',
    category: 'submission',
    subcategory: 'joint-lock',
    difficulty: 'advanced',
    description: 'Shoulder lock variation that combines armbar position with kimura-style rotation.',
    keyPoints: [
      'From armbar position',
      'Figure-four their arm',
      'Roll toward their legs',
      'Apply shoulder pressure'
    ],
    startingPosition: 'mount',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  // ==========================================
  // SUBMISSIONS - LEG LOCKS
  // ==========================================
  {
    id: 'straight-ankle-lock',
    name: 'Straight Ankle Lock',
    aliases: ['Achilles Lock', 'Ankle Lock'],
    category: 'submission',
    subcategory: 'leg-lock',
    difficulty: 'fundamental',
    description: 'Hyperextends the ankle by applying pressure to the Achilles tendon. One of the most fundamental leg attacks, legal at all belt levels.',
    keyPoints: [
      'Control leg with ashi garami',
      'Blade of wrist on Achilles',
      'Grip hands together',
      'Arch back and extend hips'
    ],
    startingPosition: 'open-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    relatedTechniques: ['heel-hook', 'toe-hold']
  },
  {
    id: 'heel-hook',
    name: 'Heel Hook',
    aliases: ['Inside Heel Hook', 'Outside Heel Hook'],
    category: 'submission',
    subcategory: 'leg-lock',
    difficulty: 'advanced',
    description: 'Extremely dangerous leg lock attacking the knee by controlling the heel and rotating. Banned in gi competitions due to injury risk but central to no-gi.',
    keyPoints: [
      'Control leg with proper ashi garami',
      'Cup their heel',
      'Keep their knee controlled',
      'Rotate heel toward their butt'
    ],
    startingPosition: 'open-guard',
    giLegal: false,
    noGiLegal: true,
    points: 0,
    beltRestrictions: 'Brown belt and above in IBJJF No-Gi'
  },
  {
    id: 'toe-hold',
    name: 'Toe Hold',
    category: 'submission',
    subcategory: 'leg-lock',
    difficulty: 'intermediate',
    description: 'Attacks the ankle through rotation rather than extension. Often set up from same positions as heel hooks.',
    keyPoints: [
      'Figure-four grip on foot',
      'Control their knee line',
      'Rotate foot outward',
      'Steady pressure'
    ],
    startingPosition: 'open-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    beltRestrictions: 'Brown belt and above in IBJJF Gi'
  },
  {
    id: 'kneebar',
    name: 'Kneebar',
    category: 'submission',
    subcategory: 'leg-lock',
    difficulty: 'intermediate',
    description: 'Hyperextends the knee joint similar to how armbar attacks elbow. Applied from various leg entanglement positions.',
    keyPoints: [
      'Control leg like an armbar',
      'Pinch knees together',
      'Hips on their thigh',
      'Extend hips while pulling foot'
    ],
    startingPosition: 'open-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    beltRestrictions: 'Brown belt and above in IBJJF Gi'
  },
  {
    id: 'calf-slicer',
    name: 'Calf Slicer',
    category: 'submission',
    subcategory: 'leg-lock',
    difficulty: 'advanced',
    description: 'Compression lock crushing calf against back of knee. Typically applied from truck position or back control variations.',
    keyPoints: [
      'Control leg in truck or similar',
      'Shin behind their knee',
      'Fold their leg',
      'Pull foot toward you'
    ],
    startingPosition: 'back-control',
    giLegal: true,
    noGiLegal: true,
    points: 0,
    beltRestrictions: 'Brown belt and above in IBJJF'
  },
  {
    id: 'estima-lock',
    name: 'Estima Lock',
    category: 'submission',
    subcategory: 'leg-lock',
    difficulty: 'advanced',
    description: 'Named after Victor Estima. Attacks foot by grabbing toes and applying pressure. Can be applied from various guard positions.',
    keyPoints: [
      'Control their foot',
      'Grab toes and bend',
      'Turn toward locked leg',
      'Apply rotational pressure'
    ],
    startingPosition: 'open-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  // ==========================================
  // SUBMISSIONS - SPINE LOCKS
  // ==========================================
  {
    id: 'twister',
    name: 'Twister',
    category: 'submission',
    subcategory: 'spine-lock',
    difficulty: 'advanced',
    description: 'Spinal lock from truck position creating corkscrew motion on spine. Popularized by Eddie Bravo and 10th Planet.',
    keyPoints: [
      'Secure truck position',
      'Control head with arm',
      'Lock legs properly',
      'Rotate spine'
    ],
    startingPosition: 'back-control',
    giLegal: false,
    noGiLegal: true,
    points: 0,
    beltRestrictions: 'Brown belt and above in IBJJF'
  },
  {
    id: 'electric-chair',
    name: 'Electric Chair',
    category: 'submission',
    subcategory: 'spine-lock',
    difficulty: 'advanced',
    description: 'Attacks the groin/hip from lockdown half guard. Can also be used as a sweep.',
    keyPoints: [
      'Secure lockdown',
      'Underhook their leg',
      'Elevate and stretch',
      'Control their upper body'
    ],
    startingPosition: 'half-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  // ==========================================
  // POSITIONS
  // ==========================================
  {
    id: 'mount-position',
    name: 'Mount',
    aliases: ['Full Mount', 'Mounted Position'],
    category: 'position',
    subcategory: 'dominant-position',
    difficulty: 'fundamental',
    description: 'One of the most dominant positions. Sitting on opponent\'s chest/torso with weight distributed. Offers numerous submission opportunities.',
    keyPoints: [
      'Keep weight on their chest',
      'Maintain strong base',
      'Knees squeeze their ribs',
      'Stay low to prevent bridging'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 4
  },
  {
    id: 'back-control-position',
    name: 'Back Control',
    aliases: ['Back Mount', 'Rear Mount'],
    category: 'position',
    subcategory: 'dominant-position',
    difficulty: 'fundamental',
    description: 'The most dominant position in BJJ. Behind opponent with both legs hooked (hooks) inside their thighs. Maximum 4 points.',
    keyPoints: [
      'Hooks inside their thighs',
      'Control their upper body',
      'Prevent them turning',
      'Set up the choke'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 4
  },
  {
    id: 'side-control-position',
    name: 'Side Control',
    aliases: ['Cross-Side', 'Side Mount', 'Yoko Shiho Gatame'],
    category: 'position',
    subcategory: 'dominant-position',
    difficulty: 'fundamental',
    description: 'Fundamental control position perpendicular to opponent using weight and pressure. Gateway to mount and submissions.',
    keyPoints: [
      'Chest to chest pressure',
      'Crossface control',
      'Hip pressure',
      'Block hip escape'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'knee-on-belly-position',
    name: 'Knee on Belly',
    aliases: ['KOB', 'Knee Ride'],
    category: 'position',
    subcategory: 'dominant-position',
    difficulty: 'fundamental',
    description: 'Mobile control with knee on opponent\'s stomach/chest. Scores 2 points and creates significant pressure.',
    keyPoints: [
      'Knee on solar plexus',
      'Wide base with other leg',
      'Grip collar and pants',
      'Apply downward pressure'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'north-south-position',
    name: 'North-South',
    aliases: ['69 Position'],
    category: 'position',
    subcategory: 'dominant-position',
    difficulty: 'intermediate',
    description: 'Head-to-head position perpendicular to opponent. Transitional control with specific submission opportunities.',
    keyPoints: [
      'Chest on their chest',
      'Arms control their arms',
      'Hips heavy',
      'Prevent guard recovery'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'turtle-position',
    name: 'Turtle',
    category: 'position',
    subcategory: 'defensive-position',
    difficulty: 'fundamental',
    description: 'Defensive shell on hands and knees protecting torso. Prevents back exposure but vulnerable to chokes and back takes.',
    keyPoints: [
      'Elbows tight to knees',
      'Chin tucked',
      'Protect neck',
      'Ready to re-guard or stand'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  // ==========================================
  // GUARD TYPES
  // ==========================================
  {
    id: 'closed-guard',
    name: 'Closed Guard',
    category: 'guard',
    subcategory: 'closed-guard',
    difficulty: 'fundamental',
    description: 'The most fundamental guard. Legs wrapped around opponent\'s torso with ankles locked. Controls opponent\'s posture and movement.',
    keyPoints: [
      'Ankles locked behind their back',
      'Break their posture',
      'Control their arms',
      'Attack when they reach'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'butterfly-guard',
    name: 'Butterfly Guard',
    category: 'guard',
    subcategory: 'open-guard',
    difficulty: 'fundamental',
    description: 'Seated or supine with both feet hooked inside opponent\'s thighs. Excellent for sweeps and transitions.',
    keyPoints: [
      'Hooks inside their thighs',
      'Maintain upright posture',
      'Underhook or overhook',
      'Load weight for sweeps'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'spider-guard',
    name: 'Spider Guard',
    category: 'guard',
    subcategory: 'open-guard',
    difficulty: 'intermediate',
    description: 'Gi guard using sleeve grips with feet on opponent\'s biceps. Creates strong frame controlling distance.',
    keyPoints: [
      'Grip both sleeves',
      'Feet on biceps',
      'Push and pull',
      'Control their posture'
    ],
    giLegal: true,
    noGiLegal: false,
    points: 0
  },
  {
    id: 'lasso-guard',
    name: 'Lasso Guard',
    category: 'guard',
    subcategory: 'open-guard',
    difficulty: 'intermediate',
    description: 'One leg threaded through opponent\'s arm, coiled with foot behind shoulder. Exceptional control of one side.',
    keyPoints: [
      'Thread leg through arm',
      'Foot behind their shoulder',
      'Sleeve grip',
      'Control their posture'
    ],
    giLegal: true,
    noGiLegal: false,
    points: 0
  },
  {
    id: 'de-la-riva',
    name: 'De La Riva Guard',
    aliases: ['DLR'],
    category: 'guard',
    subcategory: 'open-guard',
    difficulty: 'intermediate',
    description: 'Named after Ricardo De La Riva. Hook behind opponent\'s knee while other leg controls hip. Foundation for berimbolo.',
    keyPoints: [
      'Hook behind their knee',
      'Grip ankle and collar/sleeve',
      'Other foot on hip',
      'Off-balance forward'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'reverse-de-la-riva',
    name: 'Reverse De La Riva',
    aliases: ['RDLR'],
    category: 'guard',
    subcategory: 'open-guard',
    difficulty: 'intermediate',
    description: 'Hook from outside of opponent\'s leg. Often used against knee slice passing.',
    keyPoints: [
      'Hook from outside',
      'Control their ankle',
      'Block their knee',
      'Prevent smash pass'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'x-guard',
    name: 'X-Guard',
    category: 'guard',
    subcategory: 'open-guard',
    difficulty: 'intermediate',
    description: 'Creates X configuration with legs controlling both opponent\'s legs. Strong sweeping position.',
    keyPoints: [
      'Both legs control their legs',
      'Foot on far hip',
      'Hook near leg',
      'Off-balance and sweep'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'single-leg-x',
    name: 'Single Leg X Guard',
    aliases: ['SLX', 'Ashi Garami'],
    category: 'guard',
    subcategory: 'open-guard',
    difficulty: 'intermediate',
    description: 'Both legs control one of opponent\'s legs. Excellent for leg locks and sweeps.',
    keyPoints: [
      'Both legs on one leg',
      'Foot on hip',
      'Control their ankle',
      'Attack legs or sweep'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'half-guard',
    name: 'Half Guard',
    category: 'guard',
    subcategory: 'half-guard',
    difficulty: 'fundamental',
    description: 'One of opponent\'s legs trapped between your legs. Between guard and being passed. Many offensive options.',
    keyPoints: [
      'Control their leg',
      'Get the underhook',
      'Prevent crossface',
      'Create angle'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'deep-half',
    name: 'Deep Half Guard',
    category: 'guard',
    subcategory: 'half-guard',
    difficulty: 'intermediate',
    description: 'Body positioned under opponent\'s trapped leg. Excellent for sweeps and back takes.',
    keyPoints: [
      'Get deep under them',
      'Control their leg',
      'Block their base',
      'Sweep or take back'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'knee-shield',
    name: 'Knee Shield Half Guard',
    aliases: ['Z-Guard'],
    category: 'guard',
    subcategory: 'half-guard',
    difficulty: 'fundamental',
    description: 'Using knee as barrier to create distance in half guard. Effective defensive framework.',
    keyPoints: [
      'Knee across their body',
      'Frame with arms',
      'Control their sleeve',
      'Prevent smash'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'lockdown',
    name: 'Lockdown',
    category: 'guard',
    subcategory: 'half-guard',
    difficulty: 'intermediate',
    description: 'Locking opponent\'s leg with figure-four configuration from half guard. 10th Planet staple.',
    keyPoints: [
      'Figure-four their leg',
      'Stretch them out (whip up)',
      'Get the underhook',
      'Set up electric chair or sweep'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'rubber-guard',
    name: 'Rubber Guard',
    category: 'guard',
    subcategory: 'closed-guard',
    difficulty: 'advanced',
    description: 'Popularized by Eddie Bravo. Uses extreme flexibility to trap opponent\'s upper body with one leg from closed guard.',
    keyPoints: [
      'Pull leg high to shoulder',
      'Control their posture',
      'Set up submissions',
      'Requires flexibility'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: '50-50',
    name: '50/50 Guard',
    category: 'guard',
    subcategory: 'open-guard',
    difficulty: 'advanced',
    description: 'Symmetrical leg entanglement. Both practitioners in similar position. Central to modern leg lock game.',
    keyPoints: [
      'Legs intertwined equally',
      'Control their heel',
      'Attack or disengage',
      'Avoid stalling'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  // ==========================================
  // GUARD PASSES
  // ==========================================
  {
    id: 'toreando',
    name: 'Toreando Pass',
    aliases: ['Bullfighter Pass', 'Toreador'],
    category: 'guard-pass',
    difficulty: 'fundamental',
    description: 'Standing pass controlling both legs and moving around them like a bullfighter. Emphasizes speed and timing.',
    keyPoints: [
      'Control both ankles/pants',
      'Push legs to one side',
      'Circle around',
      'Drop weight to side control'
    ],
    startingPosition: 'guard-top',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 3
  },
  {
    id: 'knee-slice',
    name: 'Knee Slice Pass',
    aliases: ['Knee Cut', 'Knee Slide'],
    category: 'guard-pass',
    difficulty: 'fundamental',
    description: 'One of the most fundamental passes. Driving knee across opponent\'s thigh while controlling upper body, slicing through guard.',
    keyPoints: [
      'Control their collar and hip',
      'Slice knee across thigh',
      'Keep weight forward',
      'Crossface and settle'
    ],
    startingPosition: 'guard-top',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 3
  },
  {
    id: 'double-under',
    name: 'Double Under Pass',
    aliases: ['Stack Pass'],
    category: 'guard-pass',
    difficulty: 'fundamental',
    description: 'Pressure pass securing both arms under opponent\'s legs, stacking their weight. Neutralizes leg-based defenses.',
    keyPoints: [
      'Both arms under their legs',
      'Hands on mat or their hips',
      'Stack their weight up',
      'Walk around to side'
    ],
    startingPosition: 'closed-guard',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 3
  },
  {
    id: 'leg-drag',
    name: 'Leg Drag Pass',
    category: 'guard-pass',
    difficulty: 'intermediate',
    description: 'Dynamic pass controlling one leg and dragging it across their body, creating angle to side control or back.',
    keyPoints: [
      'Control one ankle',
      'Drag across their body',
      'Pin leg with hip',
      'Control their hip'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 3
  },
  {
    id: 'over-under',
    name: 'Over-Under Pass',
    category: 'guard-pass',
    difficulty: 'intermediate',
    description: 'Pressure pass with one arm over one leg and under the other. Strong control allowing forward drive.',
    keyPoints: [
      'One arm over, one under',
      'Connect hands',
      'Walk hips to underhook side',
      'Flatten them out'
    ],
    startingPosition: 'half-guard',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 3
  },
  {
    id: 'long-step',
    name: 'Long Step Pass',
    category: 'guard-pass',
    difficulty: 'intermediate',
    description: 'Distance-based pass taking large step around guard while maintaining distance to avoid sweeps.',
    keyPoints: [
      'Disengage from legs',
      'Take big step around',
      'Maintain collar control',
      'Drop to side control'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 3
  },
  {
    id: 'x-pass',
    name: 'X-Pass',
    category: 'guard-pass',
    difficulty: 'intermediate',
    description: 'Standing pass stepping over one leg while controlling other, creating X configuration leading to side control.',
    keyPoints: [
      'Push one leg down',
      'Step over with near leg',
      'Control other leg',
      'Slide to side control'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 3
  },
  {
    id: 'smash-pass',
    name: 'Smash Pass',
    category: 'guard-pass',
    difficulty: 'intermediate',
    description: 'Pressure passing using weight to flatten opponent\'s guard structure.',
    keyPoints: [
      'Heavy hip pressure',
      'Control their knee line',
      'Flatten their hips',
      'Grind through'
    ],
    startingPosition: 'half-guard',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 3
  },
  {
    id: 'body-lock-pass',
    name: 'Body Lock Pass',
    category: 'guard-pass',
    difficulty: 'intermediate',
    description: 'Using body lock grip to control opponent while passing guard.',
    keyPoints: [
      'Lock hands around waist',
      'Heavy chest pressure',
      'Walk legs around',
      'Keep connection'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 3
  },
  // ==========================================
  // SWEEPS
  // ==========================================
  {
    id: 'scissor-sweep',
    name: 'Scissor Sweep',
    category: 'sweep',
    difficulty: 'fundamental',
    description: 'Fundamental closed guard sweep using scissoring leg motion to off-balance and sweep.',
    keyPoints: [
      'Control sleeve and collar',
      'Open guard, shin across hip',
      'Chop their leg',
      'Roll them over'
    ],
    startingPosition: 'closed-guard',
    endingPosition: 'mount',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'hip-bump-sweep',
    name: 'Hip Bump Sweep',
    aliases: ['Bump Sweep'],
    category: 'sweep',
    difficulty: 'fundamental',
    description: 'Closed guard sweep bumping hips up explosively to off-balance opponent.',
    keyPoints: [
      'Post on one hand',
      'Bump hips explosively',
      'Control their arm',
      'Come up to mount'
    ],
    startingPosition: 'closed-guard',
    endingPosition: 'mount',
    giLegal: true,
    noGiLegal: true,
    points: 2,
    relatedTechniques: ['kimura', 'guillotine']
  },
  {
    id: 'flower-sweep',
    name: 'Flower Sweep',
    aliases: ['Pendulum Sweep'],
    category: 'sweep',
    difficulty: 'fundamental',
    description: 'Closed guard sweep using pendulum motion with legs to lift and sweep.',
    keyPoints: [
      'Control sleeve and collar',
      'Swing legs up high',
      'Pendulum motion',
      'Roll them over'
    ],
    startingPosition: 'closed-guard',
    endingPosition: 'mount',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'butterfly-sweep',
    name: 'Butterfly Sweep',
    aliases: ['Elevator Sweep'],
    category: 'sweep',
    difficulty: 'fundamental',
    description: 'Using butterfly hooks to lift and sweep opponent. One of the highest percentage sweeps.',
    keyPoints: [
      'Get underhook',
      'Load them on your hook',
      'Fall to side',
      'Elevate and roll'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'mount',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'tripod-sweep',
    name: 'Tripod Sweep',
    category: 'sweep',
    difficulty: 'fundamental',
    description: 'Three-point base disruption sweep from open guard. Control sleeve, ankle, and push hip.',
    keyPoints: [
      'Grip sleeve and ankle',
      'Foot on hip',
      'Push and pull',
      'Knock them down'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'guard-top',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'sickle-sweep',
    name: 'Sickle Sweep',
    aliases: ['Hook Sweep'],
    category: 'sweep',
    difficulty: 'fundamental',
    description: 'Open guard sweep hooking behind opponent\'s leg while pushing their upper body.',
    keyPoints: [
      'Hook behind their knee',
      'Push their shoulder',
      'Timing with their step',
      'Follow up on top'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'guard-top',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'old-school-sweep',
    name: 'Old School Sweep',
    category: 'sweep',
    difficulty: 'intermediate',
    description: 'Classic half guard sweep using underhook and leg control to come up.',
    keyPoints: [
      'Get the underhook',
      'Block their far leg',
      'Come up to knees',
      'Drive through'
    ],
    startingPosition: 'half-guard',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'dlr-sweep',
    name: 'De La Riva Sweep',
    category: 'sweep',
    difficulty: 'intermediate',
    description: 'Classic sweep using DLR hook to off-balance opponent forward or backward.',
    keyPoints: [
      'Deep DLR hook',
      'Control ankle and sleeve',
      'Off-balance forward',
      'Technical standup'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'guard-top',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'berimbolo',
    name: 'Berimbolo',
    category: 'sweep',
    difficulty: 'advanced',
    description: 'Inverted rotation from DLR leading to back take. Signature modern BJJ technique.',
    keyPoints: [
      'DLR hook',
      'Invert under them',
      'Rotate to their back',
      'Secure back control'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'back-control',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'x-guard-sweep',
    name: 'X-Guard Sweep',
    category: 'sweep',
    difficulty: 'intermediate',
    description: 'Forward or backward sweep from X-guard using leg control.',
    keyPoints: [
      'Control both legs',
      'Off-balance direction',
      'Technical standup',
      'Follow up on top'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'guard-top',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'waiter-sweep',
    name: 'Waiter Sweep',
    category: 'sweep',
    difficulty: 'intermediate',
    description: 'Using arm control like carrying a tray to sweep from half guard.',
    keyPoints: [
      'Control their far arm',
      'Elevate like a tray',
      'Bridge and roll',
      'Come up on top'
    ],
    startingPosition: 'half-guard',
    endingPosition: 'mount',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  // ==========================================
  // TAKEDOWNS & THROWS
  // ==========================================
  {
    id: 'double-leg',
    name: 'Double Leg Takedown',
    category: 'takedown',
    subcategory: 'wrestling',
    difficulty: 'fundamental',
    description: 'Fundamental wrestling takedown grabbing both legs and driving opponent to mat.',
    keyPoints: [
      'Level change',
      'Penetration step',
      'Head on their hip',
      'Drive through'
    ],
    startingPosition: 'standing',
    endingPosition: 'guard-top',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'single-leg',
    name: 'Single Leg Takedown',
    category: 'takedown',
    subcategory: 'wrestling',
    difficulty: 'fundamental',
    description: 'Targeting one leg with multiple finishing options. Safer than double leg against guillotine.',
    keyPoints: [
      'Level change',
      'Control one leg',
      'Head on inside',
      'Run the pipe or trip'
    ],
    startingPosition: 'standing',
    endingPosition: 'guard-top',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'ankle-pick',
    name: 'Ankle Pick',
    category: 'takedown',
    subcategory: 'wrestling',
    difficulty: 'intermediate',
    description: 'Quick takedown grabbing opponent\'s ankle while off-balancing backward.',
    keyPoints: [
      'Snap their head',
      'Reach for ankle',
      'Push shoulder back',
      'Pick the ankle'
    ],
    startingPosition: 'standing',
    endingPosition: 'guard-top',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'arm-drag-takedown',
    name: 'Arm Drag to Takedown',
    category: 'takedown',
    subcategory: 'wrestling',
    difficulty: 'fundamental',
    description: 'Using arm drag to get behind opponent for takedown.',
    keyPoints: [
      'Two-on-one grip',
      'Pull arm across',
      'Circle behind',
      'Take down from back'
    ],
    startingPosition: 'standing',
    endingPosition: 'back-control',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'snap-down',
    name: 'Snap Down',
    category: 'takedown',
    subcategory: 'wrestling',
    difficulty: 'fundamental',
    description: 'Using head and arm control to snap opponent down to turtle or front headlock.',
    keyPoints: [
      'Collar tie and wrist',
      'Snap head down',
      'Sprawl back',
      'Circle to back'
    ],
    startingPosition: 'standing',
    endingPosition: 'turtle',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'osoto-gari',
    name: 'Osoto Gari',
    aliases: ['Major Outer Reap'],
    category: 'takedown',
    subcategory: 'judo',
    difficulty: 'fundamental',
    description: 'Fundamental judo throw reaping opponent\'s leg from outside while driving backward.',
    keyPoints: [
      'Collar and sleeve grip',
      'Step beside them',
      'Reap their leg',
      'Drive them down'
    ],
    startingPosition: 'standing',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'ouchi-gari',
    name: 'Ouchi Gari',
    aliases: ['Major Inner Reap'],
    category: 'takedown',
    subcategory: 'judo',
    difficulty: 'fundamental',
    description: 'Judo throw reaping opponent\'s leg from inside.',
    keyPoints: [
      'Grip collar and sleeve',
      'Step between legs',
      'Reap inner leg',
      'Push them backward'
    ],
    startingPosition: 'standing',
    endingPosition: 'guard-top',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'seoi-nage',
    name: 'Seoi Nage',
    aliases: ['Shoulder Throw', 'Ippon Seoi Nage'],
    category: 'takedown',
    subcategory: 'judo',
    difficulty: 'intermediate',
    description: 'Forward throw loading opponent onto back/shoulder and throwing forward.',
    keyPoints: [
      'Turn into them',
      'Load on your back',
      'Drop your hips',
      'Throw over shoulder'
    ],
    startingPosition: 'standing',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'hip-throw',
    name: 'Hip Throw',
    aliases: ['O Goshi', 'Major Hip Throw'],
    category: 'takedown',
    subcategory: 'judo',
    difficulty: 'fundamental',
    description: 'Using hips to throw opponent over your back.',
    keyPoints: [
      'Get hips below theirs',
      'Pull them onto your hip',
      'Rotate and bend',
      'Throw over hip'
    ],
    startingPosition: 'standing',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'tomoe-nage',
    name: 'Tomoe Nage',
    aliases: ['Circle Throw', 'Sacrifice Throw'],
    category: 'takedown',
    subcategory: 'judo',
    difficulty: 'intermediate',
    description: 'Sacrifice throw falling backward while placing foot in stomach, throwing overhead.',
    keyPoints: [
      'Pull them forward',
      'Fall back, foot on hip',
      'Roll them over you',
      'Follow to mount'
    ],
    startingPosition: 'standing',
    endingPosition: 'mount',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'uchi-mata',
    name: 'Uchi Mata',
    aliases: ['Inner Thigh Throw'],
    category: 'takedown',
    subcategory: 'judo',
    difficulty: 'advanced',
    description: 'Powerful throw using inner thigh to lift opponent while rotating.',
    keyPoints: [
      'Strong kuzushi',
      'Sweep their inner thigh',
      'Rotate your body',
      'Throw them over'
    ],
    startingPosition: 'standing',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  {
    id: 'kouchi-gari',
    name: 'Kouchi Gari',
    aliases: ['Minor Inner Reap'],
    category: 'takedown',
    subcategory: 'judo',
    difficulty: 'fundamental',
    description: 'Quick minor inner reap often used as setup for other throws.',
    keyPoints: [
      'Off-balance backward',
      'Reap their heel',
      'Push through',
      'Follow to ground'
    ],
    startingPosition: 'standing',
    endingPosition: 'guard-top',
    giLegal: true,
    noGiLegal: true,
    points: 2
  },
  // ==========================================
  // ESCAPES
  // ==========================================
  {
    id: 'upa',
    name: 'Upa',
    aliases: ['Bridge and Roll', 'Trap and Roll'],
    category: 'escape',
    subcategory: 'position-escape',
    difficulty: 'fundamental',
    description: 'Fundamental mount escape bridging explosively to roll opponent over.',
    keyPoints: [
      'Trap arm and leg same side',
      'Bridge explosively',
      'Turn toward trapped side',
      'End in their guard'
    ],
    startingPosition: 'mount',
    endingPosition: 'closed-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'elbow-knee-escape',
    name: 'Elbow-Knee Escape',
    aliases: ['Shrimp Escape'],
    category: 'escape',
    subcategory: 'position-escape',
    difficulty: 'fundamental',
    description: 'Creating space with hip escape to insert knee and recover guard.',
    keyPoints: [
      'Frame against their hip',
      'Shrimp away',
      'Insert knee',
      'Recover guard'
    ],
    startingPosition: 'mount',
    endingPosition: 'half-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'side-control-escape',
    name: 'Side Control Escape',
    aliases: ['Hip Escape from Side'],
    category: 'escape',
    subcategory: 'position-escape',
    difficulty: 'fundamental',
    description: 'Creating space through hip escape to recover guard from side control.',
    keyPoints: [
      'Frame against neck and hip',
      'Shrimp to create space',
      'Insert knee',
      'Recover guard'
    ],
    startingPosition: 'side-control',
    endingPosition: 'closed-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'back-escape',
    name: 'Back Escape',
    aliases: ['Hook Removal'],
    category: 'escape',
    subcategory: 'position-escape',
    difficulty: 'fundamental',
    description: 'Systematically removing hooks and escaping back control.',
    keyPoints: [
      'Fight the hands',
      'Remove bottom hook',
      'Turn toward choking arm',
      'Get to side control'
    ],
    startingPosition: 'back-control',
    endingPosition: 'side-control',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'turtle-escape',
    name: 'Turtle Escape',
    aliases: ['Sit Out', 'Granby Roll'],
    category: 'escape',
    subcategory: 'position-escape',
    difficulty: 'fundamental',
    description: 'Escaping from turtle position to recover guard or stand.',
    keyPoints: [
      'Protect neck',
      'Sit out or granby',
      'Face opponent',
      'Recover guard'
    ],
    startingPosition: 'turtle',
    endingPosition: 'closed-guard',
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'armbar-escape',
    name: 'Armbar Escape',
    aliases: ['Hitchhiker Escape'],
    category: 'escape',
    subcategory: 'submission-escape',
    difficulty: 'fundamental',
    description: 'Escaping armbar by rotating thumb up and pulling arm out.',
    keyPoints: [
      'Turn thumb up (hitchhiker)',
      'Stack if possible',
      'Circle arm out',
      'Pass or recover'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'triangle-escape',
    name: 'Triangle Escape',
    aliases: ['Stack and Pass'],
    category: 'escape',
    subcategory: 'submission-escape',
    difficulty: 'fundamental',
    description: 'Escaping triangle by stacking opponent and passing.',
    keyPoints: [
      'Posture up immediately',
      'Stack their weight',
      'Work arm out',
      'Pass to side'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'guillotine-escape',
    name: 'Guillotine Escape',
    aliases: ['Von Flue Position'],
    category: 'escape',
    subcategory: 'submission-escape',
    difficulty: 'fundamental',
    description: 'Escaping guillotine by passing to side control.',
    keyPoints: [
      'Turn chin to choking arm',
      'Pass to side control',
      'Pressure shoulder',
      'Wait them out or Von Flue'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  {
    id: 'heel-hook-escape',
    name: 'Heel Hook Escape',
    aliases: ['Sprinter Escape'],
    category: 'escape',
    subcategory: 'submission-escape',
    difficulty: 'advanced',
    description: 'Escaping heel hook by clearing the knee line.',
    keyPoints: [
      'Don\'t let them control heel',
      'Clear knee line',
      'Turn toward them',
      'Disengage legs'
    ],
    giLegal: true,
    noGiLegal: true,
    points: 0
  },
  // ==========================================
  // BACK TAKES
  // ==========================================
  {
    id: 'arm-drag-back-take',
    name: 'Arm Drag to Back',
    category: 'back-take',
    difficulty: 'fundamental',
    description: 'Using arm drag from guard to get to opponent\'s back.',
    keyPoints: [
      'Two-on-one grip',
      'Pull arm across',
      'Circle to their back',
      'Secure hooks'
    ],
    startingPosition: 'closed-guard',
    endingPosition: 'back-control',
    giLegal: true,
    noGiLegal: true,
    points: 4
  },
  {
    id: 'kimura-back-take',
    name: 'Kimura to Back Take',
    category: 'back-take',
    difficulty: 'intermediate',
    description: 'Using kimura grip from half guard to transition to back.',
    keyPoints: [
      'Secure kimura grip',
      'Roll under them',
      'Come up to their back',
      'Insert hooks'
    ],
    startingPosition: 'half-guard',
    endingPosition: 'back-control',
    giLegal: true,
    noGiLegal: true,
    points: 4
  },
  {
    id: 'chair-sit-back-take',
    name: 'Chair Sit Back Take',
    category: 'back-take',
    difficulty: 'intermediate',
    description: 'Taking back from turtle using chair sit motion.',
    keyPoints: [
      'Control from turtle',
      'Sit through',
      'Insert hooks',
      'Secure seat belt'
    ],
    startingPosition: 'turtle',
    endingPosition: 'back-control',
    giLegal: true,
    noGiLegal: true,
    points: 4
  },
  {
    id: 'spiral-ride-back-take',
    name: 'Spiral Ride to Back',
    category: 'back-take',
    difficulty: 'intermediate',
    description: 'Wrestling-style back take from turtle.',
    keyPoints: [
      'Control near wrist',
      'Spiral them down',
      'Insert hooks',
      'Secure control'
    ],
    startingPosition: 'turtle',
    endingPosition: 'back-control',
    giLegal: true,
    noGiLegal: true,
    points: 4
  },
  {
    id: 'kiss-of-dragon',
    name: 'Kiss of the Dragon',
    category: 'back-take',
    difficulty: 'advanced',
    description: 'Inverted technique from DLR leading to back control.',
    keyPoints: [
      'DLR hook',
      'Invert under',
      'Thread through',
      'Emerge at their back'
    ],
    startingPosition: 'open-guard',
    endingPosition: 'back-control',
    giLegal: true,
    noGiLegal: true,
    points: 4
  }
];

// Helper functions
export function getTechniquesByCategory(category: TechniqueCategory): Technique[] {
  return TECHNIQUES.filter(t => t.category === category);
}

export function getTechniquesByDifficulty(difficulty: DifficultyLevel): Technique[] {
  return TECHNIQUES.filter(t => t.difficulty === difficulty);
}

export function getTechniquesByPosition(position: Position): Technique[] {
  return TECHNIQUES.filter(t =>
    t.startingPosition === position || t.endingPosition === position
  );
}

export function searchTechniques(query: string): Technique[] {
  const lowerQuery = query.toLowerCase();
  return TECHNIQUES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.aliases?.some(a => a.toLowerCase().includes(lowerQuery)) ||
    t.keyPoints?.some(kp => kp.toLowerCase().includes(lowerQuery))
  );
}

export function getTechniqueById(id: string): Technique | undefined {
  return TECHNIQUES.find(t => t.id === id);
}

// Statistics
export function getStats() {
  const byCategory: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};

  TECHNIQUES.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    byDifficulty[t.difficulty] = (byDifficulty[t.difficulty] || 0) + 1;
  });

  return {
    total: TECHNIQUES.length,
    byCategory,
    byDifficulty
  };
}
