const helpers = require('../helpers');

module.exports = {
  'content': function(data){
    return `Hi ${data.customerName}

    <p>Your Order is received and the total amount is <span style="font-weight:bold">${helpers.formatMoney(data.orderTotal, '$')}</span></p>

    <p>Your order will be delivered to
    <b>${data.deliveryAddress}</b>
    </p>

    <p><b><u>Order Details</u></b></p>
    <p>${data.orderDetails}</p>

    Cheers<br/>
    PirplePizza
    `;
  }
}
