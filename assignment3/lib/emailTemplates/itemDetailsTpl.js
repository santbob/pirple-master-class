const helpers = require('../helpers')

module.exports = {
  'content': function(data) {
    return `
      <p>
        <div style="display:inline-block; font-size:medium">
          <div>${data.size.name} ${data.crust.name} ${data.meat} pizza with ${data.sauce} sauce</div>
          <div style="font-size:small">Toppings - ${data.toppings.toString()}</div>
        </div>
        <div style="display:inline-block;font-weight:bold;vertical-align:top; margin-left:15px">${helpers.formatMoney(data.itemTotal, '$')}</div>
      </div>
      </p>
    `;
  }
};
