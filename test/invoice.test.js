var test = require('node:test');
var assert = require('node:assert/strict');

var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function item(name, price, qty, hsn, gstRate) {
  return { name: name, price: price, qty: qty, hsn: hsn, gstRate: gstRate };
}

function calculate(order) {
  return {
    invoice: invoice.computeInvoiceFigures(order),
    checkout: pricing.computeTotals(order.items, order.coupon)
  };
}

test('CURRENT BEHAVIOUR: order 1001 invoice keeps 5% and 12% GST lines without a coupon', function () {
  var result = calculate({
    id: 1001,
    coupon: '',
    items: [
      item('Toor Dal', 165, 2, '0713', 5),
      item('Table Butter', 140, 2, '0405', 12)
    ]
  });

  assert.deepEqual(result.invoice, {
    subtotal: 610, discount: 0, tax: 50.1, cgst: 25.05, sgst: 25.05, total: 660.1,
    rows: [
      { name: 'Toor Dal', sku: '-', hsn: '0713', qty: 2, price: 165, gstPercent: 5, line: 330, lineTax: 16.5 },
      { name: 'Table Butter', sku: '-', hsn: '0405', qty: 2, price: 140, gstPercent: 12, line: 280, lineTax: 33.6 }
    ]
  });
  assert.deepEqual(result.checkout, { subtotal: 610, discount: 0, taxable: 610, tax: 50.1, cgst: 25.05, sgst: 25.05, total: 660.1, lines: result.checkout.lines });
});

test('order 1002 SAVE10 invoice matches checkout tax and discount', function () {
  var result = calculate({
    id: 1002,
    coupon: 'SAVE10',
    items: [item('Rice', 640, 1, '1006', 5), item('Sunflower Oil', 190, 2, '1512', 5)]
  });

  assert.equal(result.invoice.subtotal, 1020);
  assert.equal(result.invoice.tax, 45.9);
  assert.equal(result.invoice.discount, 102);
  assert.equal(result.invoice.total, 963.9);
  assert.equal(result.checkout.tax, 45.9);
  assert.equal(result.checkout.discount, 102);
  assert.equal(result.checkout.total, 963.9);
});

test('order 1004 SAVE10 invoice applies the 150-rupee discount cap', function () {
  var result = calculate({
    id: 1004,
    coupon: 'SAVE10',
    items: [item('Groundnut Oil', 1120, 2, '1508', 5)]
  });

  assert.equal(result.invoice.subtotal, 2240);
  assert.equal(result.invoice.tax, 104.5);
  assert.equal(result.invoice.discount, 150);
  assert.equal(result.invoice.total, 2194.5);
  assert.equal(result.checkout.discount, 150);
  assert.equal(result.checkout.tax, 104.5);
  assert.equal(result.checkout.total, 2194.5);
});

test('CURRENT BEHAVIOUR: order 1008 all-18-percent items match checkout with no coupon', function () {
  var result = calculate({
    id: 1008,
    coupon: '',
    items: [item('Tea', 140, 1, '0902', 18), item('Sherbet', 180, 2, '2106', 18)]
  });

  assert.equal(result.invoice.subtotal, 500);
  assert.equal(result.invoice.tax, 90);
  assert.equal(result.invoice.cgst, 45);
  assert.equal(result.invoice.sgst, 45);
  assert.equal(result.invoice.total, 590);
  assert.equal(result.checkout.total, 590);
});

test('invoice matches checkout for an HSN-priced SAVE10 order with its discount cap', function () {
  var order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [{ name: 'Groundnut Oil', price: 1120, qty: 2, hsn: '1508' }]
  };
  var invoiceFigures = invoice.computeInvoiceFigures(order);
  var checkoutFigures = pricing.computeTotals(order.items, order.coupon);

  assert.equal(invoiceFigures.subtotal, checkoutFigures.subtotal);
  assert.equal(invoiceFigures.discount, checkoutFigures.discount);
  assert.equal(invoiceFigures.tax, checkoutFigures.tax);
  assert.equal(invoiceFigures.cgst, checkoutFigures.cgst);
  assert.equal(invoiceFigures.sgst, checkoutFigures.sgst);
  assert.equal(invoiceFigures.total, checkoutFigures.total);
  assert.equal(invoiceFigures.rows[0].gstPercent, checkoutFigures.lines[0].gstPercent);
  assert.equal(invoiceFigures.rows[0].lineTax, checkoutFigures.lines[0].tax);
});
