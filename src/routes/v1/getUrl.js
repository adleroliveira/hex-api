const removeDiacritics = require('diacritics').remove
const extractor = require('unfluff')
const request = require('request')
const summaryTool = require('node-summary')
const sentiment = require('../../lib/sentiment')
const alignment = require('../../lib/alignment')

const getUrl = (req, res) => {
  if ('undefined' === typeof req.query.url) return res.status(403).json({
    success: false,
    message: 'Missing url parameter.'
  })

  request(req.query.url, function(error, response, html) {
    const data = extractor(html)
    // clean body text
    const text = removeDiacritics(data.text)

    if ('undefined' !== typeof req.query.category) alignment.learn(text, req.query.category)

    let sumry;
    summaryTool.summarize(data.title, text, (err, summary) => {
      if (err) sumry = ""
      sumry = summary
    });

    res
    .status(200)
    .json({
      url: data.canonicalLink || req.query.url,
      domain: '',
      title: data.title || '',
      keywords: data.tags || [],
      topics: '(bayes)',
      subject: '',
      summary: sumry || '',
      sentiment: sentiment(text),
      credibility_scoring: '(0~1)',
      alignment: alignment.categorize(text),
      leaning: '(right, left)',
      dump: alignment.dump()
    })
  })
}

module.exports = getUrl