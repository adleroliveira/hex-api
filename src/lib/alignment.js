const bayes = require('bayes')
const classifier = bayes()
const learn = (text, category) => classifier.learn(text, category)
const categorize = text => classifier.categorize(text)
const dump = () => classifier.toJson()
const load = dump => bayes.fromJson(dump)

module.exports = {
  learn,
  categorize,
  dump,
  load
}