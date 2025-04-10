import * as tf from '@tensorflow/tfjs'
import * as use from '@tensorflow-models/universal-sentence-encoder'
import { db } from './database'

// Model Management
let modelsLoaded = false
let sentenceEncoder
let sentimentModel

// Initialize models
const initializeModels = async () => {
  if (modelsLoaded) return

  try {
    // Load Universal Sentence Encoder
    sentenceEncoder = await use.loadQnA()

    // Sentiment model architecture
    const createModel = () => {
      const model = tf.sequential()
      model.add(
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          inputShape: [512],
        }),
      )
      model.add(tf.layers.dropout({ rate: 0.2 }))
      model.add(
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
        }),
      )
      model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy'],
      })
      return model
    }

    // Try loading pre-trained model
    try {
      sentimentModel = await tf.loadLayersModel('/models/sentiment/model.json')
      console.log('Loaded pre-trained sentiment model')
    } catch (e) {
      console.log('Initializing new model')
      sentimentModel = createModel()
      // Note: In production, you would train the model here or load weights
    }

    modelsLoaded = true
  } catch (error) {
    console.error('Model initialization failed:', error)
    throw error
  }
}

// TF.js Sentiment Analysis
export const analyzeWithTF = async (text) => {
  if (!modelsLoaded) await initializeModels()

  try {
    // Generate embeddings
    const embeddings = await sentenceEncoder.embed([text])

    // Predict sentiment
    const prediction = sentimentModel.predict(embeddings)
    const score = (await prediction.data())[0]

    // Clean up
    tf.dispose([embeddings, prediction])

    return {
      sentiment: score > 0.6 ? 'POSITIVE' : score < 0.4 ? 'NEGATIVE' : 'NEUTRAL',
      confidence: Math.round(Math.abs(score - 0.5) * 200),
      score: score,
    }
  } catch (error) {
    console.error('TF analysis failed:', error)
    throw error
  }
}

// Keyword Fallback Analyzer
const keywordAnalysis = (text) => {
  const positiveWords = [
    'happy',
    'joy',
    'good',
    'great',
    'love',
    'calm',
    'Good',
    'Excellent',
    'wonderful',
    'amazing',
    'marvelous',
    'terrific',
    'fantastic',
    'joyful',
    'cheerful',
    'delighted',
    'ecstatic',
    'blissful',
    'content',
    'elated',
    'enthusiastic',
    'excited',
    'eager',
    'hopeful',
    'optimistic',
    'upbeat',
    'sanguine',
    'buoyant',
    'nice',
    'agreeable',
    'delightful',
    'charming',
    'lovely',
    'successful',
    'accomplished',
    'thriving',
    'flourishing',
    'victorious',
    'triumphant',
    'prosperous',
    'fruitful',
    'productive',
    'effective',
    'efficient',
    'beneficial',
    'advantageous',
    'favorable',
    'positive',
    'constructive',
    'helpful',
    'valuable',
    'worthwhile',
    'rewarding',
    'satisfying',
    'pleasurable',
    'enjoyable',
    'fun',
    'entertaining',
    'amusing',
    'engaging',
    'captivating',
    'fascinating',
    'interesting',
    'intriguing',
    'stimulating',
    'thought-provoking',
    'inspiring',
    'motivating',
    'encouraging',
    'uplifting',
    'heartwarming',
    'soulful',
    'spiritual',
  ]
  const negativeWords = [
    'sad',
    'angry',
    'depressed',
    'anxious',
    'bad',
    'stress',
    'awful',
    'terrible',
    'horrible',
    'dreadful',
    'atrocious',
    'abysmal',
    'appalling',
    'disastrous',
    'catastrophic',
    'lamentable',
    'unpleasant',
    'distressing',
    'unfortunate',
    'tragic',
    'miserable',
    'depressing',
    'gloomy',
    'bleak',
    'despairing',
    'hopeless',
    'pessimistic',
    'downcast',
    'disheartened',
    'dispirited',
    'demoralized',
    'defeated',
    'despondent',
  ]
  // const neutralWords = ['okay', 'fine', 'average', 'mediocre', 'ordinary', 'normal', 'standard', 'typical', 'common', 'usual', 'regular', 'routine', 'conventional', 'traditional', 'expected', 'predictable', 'unremarkable']

  let score = 0
  const words = text.toLowerCase().match(/\b\w+\b/g) || []

  words.forEach((word) => {
    if (positiveWords.includes(word)) score += 1
    if (negativeWords.includes(word)) score -= 1
  })

  const normalizedScore = Math.min(Math.max(score / 10, -1), 1)

  return {
    sentiment: score > 0 ? 'POSITIVE' : score < 0 ? 'NEGATIVE' : 'NEUTRAL',
    confidence: Math.min(Math.abs(normalizedScore) * 100, 90),
    score: (normalizedScore + 1) / 2, // Convert to 0-1 range
  }
}

// Main Analysis Function
export const analyzeSentiment = async (text) => {
  try {
    // First try TF.js analysis
    return await analyzeWithTF(text)
  } catch (error) {
    console.log('Falling back to keyword analysis')
    return keywordAnalysis(text)
  }
}

// Suggestion Generator
// [Previous imports remain the same...]

// Enhanced Suggestion Generator
export const generateSuggestions = (sentiment, confidence, keywords = []) => {
  const suggestions = {
    POSITIVE: {
      high: [
        'Your positive energy is contagious! Consider sharing it with someone who might need it today.',
        'This is a great time to start a gratitude journal or add to your existing one.',
        'Channel your energy into a creative activity like painting, writing, or music.',
        'Consider volunteering - your positive mood can make a real difference to others.',
        'Practice mindfulness to fully appreciate this positive moment.',
        'Share your good mood by complimenting or helping someone.',
      ],
      medium: [
        'Take a moment to reflect on what contributed to this positive feeling.',
        'Try a short meditation to enhance your current state of mind.',
        'Engage in physical activity to boost your energy further.',
        'Write down three things you appreciate about your current situation.',
        'Listen to uplifting music that matches your positive mood.',
      ],
    },
    NEGATIVE: {
      high: [
        "I notice you're feeling down. Would you like to try a 4-7-8 breathing exercise? (Breathe in for 4, hold for 7, exhale for 8)",
        'The Rage Room might help release these feelings safely - try our virtual smashing activity.',
        'Consider reaching out to a trusted friend or family member right now.',
        'Try our guided "Grounding Techniques" exercise to help manage intense emotions.',
        "Write freely about what you're feeling - no filter needed. You can delete it after if you want.",
        'Listen to calming music or nature sounds for 10 minutes.',
      ],
      medium: [
        'A body scan meditation might help you reconnect with yourself.',
        'Try the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
        'Go for a brief walk, even if just around your home, to shift your perspective.',
        'Write down your feelings, then write a compassionate response as if to a friend.',
        'Try our "Emotion Sculpture" activity to express these feelings creatively.',
      ],
    },
    NEUTRAL: {
      default: [
        'Your mood seems balanced. This could be a good time for self-reflection with our journal prompts.',
        'Try our "Mindful Observation" exercise to engage with your surroundings.',
        'Explore different activities in our app to discover what resonates with you today.',
        'Consider trying something slightly outside your comfort zone.',
        'Practice mindful breathing for 5 minutes to center yourself.',
        "Write down three small things you'd like to accomplish today.",
      ],
    },
  }

  // Expanded keyword-specific suggestions
  const keywordSuggestions = {
    anxious: [
      'Try our "Anxiety Relief" breathing pattern: 4-7-8 (inhale 4, hold 7, exhale 8)',
      'Progressive muscle relaxation can help - tense and release each muscle group from toes to head',
      'Create a "worry list" - write down concerns to address later, giving yourself permission to set them aside now',
    ],
    stressed: [
      'The 5-4-3-2-1 grounding technique can help: Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
      'Try our "Stress Release" guided visualization exercise',
      'Physical activity, even just stretching, can help reduce stress hormones',
    ],
    depressed: [
      'Small actions matter - try just opening a window or drinking some water',
      'Our "Compassionate Self-Talk" exercise might help shift your perspective',
      'Consider reaching out to a mental health professional - you deserve support',
    ],
    happy: [
      'Savor this moment - what exactly about it feels good? Try to extend the feeling',
      'Share your happiness with someone - it might make their day better too',
      'Create a "happy moments" list to look back on later',
    ],
    angry: [
      'Our "Rage Room" activity provides safe virtual destruction',
      'Try screaming into a pillow or punching a cushion to release tension',
      'Write an unfiltered letter (then delete it) to express your anger',
    ],
    lonely: [
      "Consider reaching out to someone you haven't talked to in a while",
      'Join one of our virtual support group sessions',
      'Interact with a pet or volunteer at an animal shelter',
    ],
    tired: [
      'Try our "Energy Boost" breathing exercise (short, sharp inhales through nose)',
      'Even 5 minutes of stretching can improve circulation and alertness',
      'Hydrate and have a healthy snack - low energy often comes from basic needs',
    ],
    overwhelmed: [
      'Break tasks into tiny steps - just focus on the very next small action',
      'Our "Priority Sorting" activity can help organize your thoughts',
      'Give yourself permission to pause - set a timer for 10 minutes of complete rest',
    ],
  }

  const intensity = confidence > 70 ? 'high' : 'medium'
  let baseSuggestions =
    sentiment === 'NEUTRAL' ? suggestions.NEUTRAL.default : suggestions[sentiment][intensity]

  // Add keyword matches with more variety
  keywords.forEach((keyword) => {
    const lowerKeyword = keyword.toLowerCase()
    if (keywordSuggestions[lowerKeyword]) {
      // Add 1-2 random suggestions per matching keyword
      const randomSuggestions = [...keywordSuggestions[lowerKeyword]]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
      baseSuggestions = [...randomSuggestions, ...baseSuggestions]
    }
  })

  // Ensure variety in final suggestions
  const uniqueSuggestions = [...new Set(baseSuggestions)]
  return uniqueSuggestions
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, 5) // Return top 5 suggestions now

  // [Rest of your existing code...]

  return baseSuggestions.slice(0, 3) // Return top 3 suggestions
}
