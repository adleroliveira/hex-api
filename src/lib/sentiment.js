const sentimentPTBR = require('sentiment-ptbr')

const sentimentLabel = num => {
  if (num > 5) return 'positive'
  if (num < -5) return 'negative'
  return 'neutral'
}

const sentiment = text => {
  const sentimentAnalysis = sentimentPTBR(text).score
  return {
    score: sentimentAnalysis,
    label: sentimentLabel(sentimentAnalysis)
  }
}

module.exports = sentiment