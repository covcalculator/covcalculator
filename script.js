const data = [
  { age: 0, deathRate: 0 },
  { age: 10, deathRate: 0.002 },
  { age: 20, deathRate: 0.002 },
  { age: 30, deathRate: 0.002 },
  { age: 40, deathRate: 0.004 },
  { age: 50, deathRate: 0.013 },
  { age: 60, deathRate: 0.036 },
  { age: 70, deathRate: 0.08 },
  { age: 80, deathRate: 0.148 }
]
for (let d of data) { d.percentOfAll = (d.deathRate) / data.reduce((ac, v) => ac + v.deathRate, 0); }

const averageDeathRate = 0.034
const noRiskDeathRate = 0.0154
const riskFactors = [
  { label: 'Cardiovascular disease', name: 'cardiovascular', deathRate: 0.105 },
  { label: 'Diabets', name: 'diabets', deathRate: 0.073 },
  { label: 'Chronic respiratory disease / Smoker', name: 'respiratory', deathRate: 0.063 },
  { label: 'Hypertension', name: 'hypertension', deathRate: 0.06 },
  { label: 'Cancer', name: 'cancer', deathRate: 0.056 },
]

function calculateDeathRate(age, risks) {
  if(!age) return averageDeathRate
  age = age > 80 ? 80 : age;

  let ageData = data.find(d => d.age == age)
  let riskDeathFactor = noRiskDeathRate / averageDeathRate
  let currentRisks = []
  if (risks.length) {
    currentRisks = riskFactors.filter(f => risks.includes(f.name))
    let risksRatesSum = currentRisks.reduce((ac, v) => ac + v.deathRate, 0)
    riskDeathFactor = risksRatesSum / averageDeathRate
  }

  let resultDeathRisk = riskDeathFactor * ageData.deathRate
  return {resultDeathRisk, currentRisks, averageDeathRate, noRiskDeathRate, ageData }
}


// VIEW

function updateCounter(data) {
  
  let demo = new CountUp(document.getElementById('output'), data.resultDeathRisk * 100, {decimalPlaces: 2, prefix:'Death risk: ', suffix: '%' });
    if (!demo.error) {
      demo.start();
    } else {
      console.error(demo.error);
    }
    let formulaEl = document.getElementById('formula')
    formulaEl.innerHTML = '<p>(medical conditions death risk / average death risk) * death rate by age</p><br/><small class="text-muted">based on WHO and worldometers.info data</small>'

    var template = document.getElementById('factsTemplate').innerHTML;
    var rendered = Mustache.to_html(template, { arr: [
      { label: 'Death risk in age range ' + data.ageData.age + '-' + (data.ageData.age + 9), value: (data.ageData.deathRate * 100).toFixed(1) + '%' },
      { label: 'Average death risk', value: (data.averageDeathRate * 100).toFixed(2) + '%' },
      { label: 'Average death risk (with no health conditions)', value: (data.noRiskDeathRate * 100).toFixed(2) + '%' },
      ...data.currentRisks.map(r => ({ label: r.label + ' average death risk', value: (r.deathRate * 100).toFixed(2) + '%' }))
      ] });
    document.getElementById('facts').innerHTML = rendered;
    document.getElementById('coffee').innerHTML = `<style>.bmc-button img{height: 34px !important;width: 35px !important;margin-bottom: 1px !important;box-shadow: none !important;border: none !important;vertical-align: middle !important;}.bmc-button{padding: 7px 10px 7px 10px !important;line-height: 35px !important;height:51px !important;min-width:217px !important;text-decoration: none !important;display:inline-flex !important;color:#ffffff !important;background-color:#79D6B5 !important;border-radius: 5px !important;border: 1px solid transparent !important;padding: 7px 10px 7px 10px !important;font-size: 22px !important;letter-spacing: 0.6px !important;box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;margin: 0 auto !important;font-family:'Cookie', cursive !important;-webkit-box-sizing: border-box !important;box-sizing: border-box !important;-o-transition: 0.3s all linear !important;-webkit-transition: 0.3s all linear !important;-moz-transition: 0.3s all linear !important;-ms-transition: 0.3s all linear !important;transition: 0.3s all linear !important;}.bmc-button:hover, .bmc-button:active, .bmc-button:focus {-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;text-decoration: none !important;box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;opacity: 0.85 !important;color:#ffffff !important;}</style><link href="https://fonts.googleapis.com/css?family=Cookie" rel="stylesheet"><a class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/bart2020"><img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Buy me a coffee"><span style="margin-left:15px;font-size:28px !important;">Buy me a coffee</span></a>`

}


// render conditions
var template = document.getElementById('conditionsTemplate').innerHTML;
var rendered = Mustache.to_html(template, { arr: riskFactors });

document.getElementById('conditionsContainer').innerHTML = rendered;


function collectInputData() {
  let risks = []
  var slider = document.getElementById("age_input");
  let age = slider.value
  $('input[type="checkbox"]:checked').each(function() {
    risks.push($(this).attr('name'))
  })
  
  return { age, risks }
}


var slider = document.getElementById("age_input");
var output = document.getElementById("age_inputValue");
output.innerHTML = slider.value;
slider.oninput = function() {
  output.innerHTML = this.value;
}

function calculate() {
  let data = collectInputData()
  let totalDeathRate = calculateDeathRate(data.age, data.risks)
  // (medical conditions death risk / average death risk) * death rate by age
  updateCounter(totalDeathRate)
}

$('.corona_input').click(() => calculate())

slider.onchange = () => calculate()