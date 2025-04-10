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
  const positiveWords = ['happy', 'joy', 'good', 'great', 'love', 'calm']
  const negativeWords = ['sad', 'angry', 'depressed', 'anxious', 'bad', 'stress']

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
export const generateSuggestions = (sentiment, confidence, keywords = []) => {
  const suggestions = {
    POSITIVE: {
      high: [
        'Your positive energy is contagious! Consider sharing it with others.',
        'This is a great time to practice gratitude journaling.',
        'Channel your positive energy into creative activities.',
      ],
      medium: [
        'Enjoy this positive moment. Maybe try a mindfulness exercise.',
        "Consider documenting what's making you happy in your journal.",
      ],
    },
    NEGATIVE: {
      high: [
        "I notice you're feeling down. Would you like to try a guided breathing exercise?",
        'The Rage Room might help release these feelings safely.',
        'Consider reaching out to someone you trust.',
      ],
      medium: [
        'A short mindfulness exercise might help shift your perspective.',
        'Journaling about these feelings might provide clarity.',
      ],
    },
    NEUTRAL: {
      default: [
        'Your mood seems balanced. Maybe try a new exercise.',
        'This could be a good time for self-reflection.',
        'Consider exploring different activities to discover what resonates.',
      ],
    },
  }

  // Add keyword-specific suggestions
  const keywordSuggestions = {
    anxious: 'The 4-7-8 breathing exercise might help calm your anxiety.',
    stressed: 'Progressive muscle relaxation could help relieve your stress.',
    depressed: 'Consider reaching out to a mental health professional.',
    happy: 'Savor this moment and consider what contributed to it.',
  }

  const intensity = confidence > 70 ? 'high' : 'medium'
  let baseSuggestions =
    sentiment === 'NEUTRAL' ? suggestions.NEUTRAL.default : suggestions[sentiment][intensity]

  // Add keyword matches
  keywords.forEach((keyword) => {
    if (keywordSuggestions[keyword]) {
      baseSuggestions = [keywordSuggestions[keyword], ...baseSuggestions]
    }
  })

  return baseSuggestions.slice(0, 3) // Return top 3 suggestions
}
