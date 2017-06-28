// const missingParams = (param) => {
//   if ('undefined' === typeof req.params[param]) return res.status(403).json({
//     success: false,
//     message: `Missing ${param} parameter.`
//   })
// }
// const alignment = require('../../lib/alignment')

// const train = (req, res) => {
//   if ('undefined' === typeof req.params.url) return res.status(403).json({
//     success: false,
//     message: 'Missing url parameter.'
//   })

//   if ('undefined' === typeof req.params.category) return res.status(403).json({
//     success: false,
//     message: 'Missing url parameter.'
//   })

//   request(req.params.url, (error, response, html) => {
//     const data = extractor(html)
//     const text = removeDiacritics(data.text)
//     alignment.

//     res
//     .status(200)
//     .json({
//       url: data.canonicalLink || req.query.url,
//       domain: '',
//       title: data.title || '',
//       keywords: data.tags || [],
//       topics: '(bayes)',
//       subject: '',
//       summary: sumry || '',
//       sentiment: sentiment(data.text),
//       credibility_scoring: '(0~1)',
//       alignment: alignment.categorize(data.text),
//       leaning: '(right, left)'
//     })
//   })
// }

// module.exports = train