export function numberToWords(num) {
  if (num === 0) return 'Zero Rupees';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function convertChunk(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
    return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+convertChunk(n%100) : '');
  }
  let result = '';
  const cr = Math.floor(num/10000000);
  const lk = Math.floor((num%10000000)/100000);
  const th = Math.floor((num%100000)/1000);
  const rem = num%1000;
  if (cr) result += convertChunk(cr)+' Crore ';
  if (lk) result += convertChunk(lk)+' Lakh ';
  if (th) result += convertChunk(th)+' Thousand ';
  if (rem) result += convertChunk(rem);
  return result.trim()+' Rupees';
}

export function formatCurrency(num) {
  return Number(num).toLocaleString('en-IN');
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'});
}

export function generateInvoiceHTML(invoice, company, client, lineItems) {
  const totalQty = lineItems.reduce((s,i)=>s+Number(i.qty),0);
  const totalAmount = Number(invoice.total_amount);
  const totalTax = lineItems.reduce((s,i)=>s+(Number(i.amount)*Number(i.igst_rate)/100),0);

  const itemRows = lineItems.map(i=>`
    <tr>
      <td class="c b">${i.sno}</td>
      <td class="b" style="text-align:left">${i.item_name}</td>
      <td class="c b">${i.hsn}</td>
      <td class="c b">${i.bags||''}</td>
      <td class="r b">${Number(i.qty)}</td>
      <td class="r b">${i.unit||'QTL'} ${formatCurrency(i.rate)}</td>
      <td class="c b">${Number(i.tax_rate)}%</td>
      <td class="r b">₹ ${formatCurrency(i.amount)}</td>
    </tr>`).join('');

  const hsnRows = lineItems.map(i=>`
    <tr>
      <td class="c b">${i.hsn}</td>
      <td class="r b">₹ ${formatCurrency(i.amount)}</td>
      <td class="c b">${Number(i.igst_rate)}%</td>
      <td class="r b">₹ ${formatCurrency(Number(i.amount)*Number(i.igst_rate)/100)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;font-size:11px;color:#000}
.w{width:210mm;margin:0 auto;border:2px solid #000}
.hdr{text-align:center;padding:10px 15px;border-bottom:2px solid #000;background:#fafafa}
.hdr h1{font-size:20px;letter-spacing:1px;margin-bottom:4px}
.hdr p{font-size:11px;line-height:1.5}
.dt{text-align:center;font-weight:bold;font-size:13px;padding:5px;border-bottom:2px solid #000;background:#e6e6e6;letter-spacing:1px}
.gr{display:flex;border-bottom:1px solid #000}
.gh{width:50%;padding:8px 10px}
.gh:first-child{border-right:1px solid #000}
.fl{margin-bottom:2px;line-height:1.6}
.fl b{display:inline-block;min-width:110px}
.st{font-weight:bold;font-size:12px;margin-bottom:4px;text-decoration:underline;text-transform:uppercase}
.cn{font-weight:bold;font-size:13px}
table{width:100%;border-collapse:collapse}
th{background:#d9d9d9;border:1px solid #000;padding:5px 4px;text-align:center;font-size:11px;font-weight:bold}
td{padding:4px 5px;font-size:11px}
.b{border:1px solid #000} .c{text-align:center} .r{text-align:right} .l{text-align:left}
.tr{font-weight:bold;background:#f0f0f0}
.aw{padding:6px 10px;border-top:1px solid #000;border-bottom:1px solid #000;font-weight:bold}
.bg{display:flex;border-bottom:1px solid #000;min-height:100px}
.bk{width:55%;padding:8px 10px;border-right:1px solid #000}
.as{width:45%;padding:8px 10px}
.ar{display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px}
.ar.t{font-weight:bold;font-size:14px;border-top:1px solid #000;padding-top:5px;margin-top:5px}
.tm{padding:6px 10px;border-bottom:1px solid #000;font-size:10px}
.tm h4{font-size:11px;margin-bottom:3px}
.tm ol{padding-left:15px}
.tm li{margin-bottom:2px}
.sg{text-align:right;padding:30px 15px 10px;font-size:11px}
.sg .sn{font-weight:bold;margin-top:25px}
.sg .sl{font-size:10px;margin-top:3px}
</style></head><body>
<div class="w">
  <div class="hdr">
    <h1>${company.name}</h1>
    <p>${company.address}, ${company.state}, ${company.pincode}</p>
    <p><b>GSTIN:</b> ${company.gstin} &nbsp;|&nbsp; <b>Mobile:</b> ${company.mobile} &nbsp;|&nbsp; <b>PAN:</b> ${company.pan}</p>
    ${company.email?`<p><b>Email:</b> ${company.email}</p>`:''}
  </div>
  <div class="dt">TAX INVOICE — ORIGINAL FOR RECIPIENT</div>
  <div class="gr">
    <div class="gh">
      <div class="fl"><b>Invoice No.:</b> ${invoice.invoice_no}</div>
      <div class="fl"><b>Invoice Date:</b> ${formatDate(invoice.invoice_date)}</div>
      <div class="fl"><b>Due Date:</b> ${formatDate(invoice.due_date)}</div>
      <div class="fl"><b>9R NO.:</b> ${invoice.rr_no||'-'}</div>
      <div class="fl"><b>Gate-pass No.:</b> ${invoice.gate_pass_no||'-'}</div>
    </div>
    <div class="gh">
      <div class="fl"><b>By Transport:</b> ${invoice.transport||'-'}</div>
      <div class="fl"><b>G.R.No.:</b> ${invoice.gr_no||'-'}</div>
      <div class="fl"><b>Broker:</b> ${invoice.broker||'-'}</div>
      <div class="fl"><b>Vehicle No.:</b> ${invoice.vehicle_no||'-'}</div>
    </div>
  </div>
  <div class="gr">
    <div class="gh">
      <div class="st">Bill To</div>
      <div class="cn">${client.name}</div>
      <div class="fl">${client.address}, ${client.state}, ${client.pincode}</div>
      <div class="fl"><b>GSTIN:</b> ${client.gstin}</div>
      <div class="fl"><b>Place of Supply:</b> ${client.place_of_supply||client.state}</div>
      <div class="fl"><b>Mobile:</b> ${client.mobile||'-'} &nbsp;|&nbsp; <b>PAN:</b> ${client.pan||'-'}</div>
    </div>
    <div class="gh">
      <div class="st">Ship To</div>
      <div class="cn">${invoice.ship_to_name||client.name}</div>
      <div class="fl">${invoice.ship_to_address||(client.address+', '+client.state+', '+client.pincode)}</div>
    </div>
  </div>
  <table>
    <thead><tr>
      <th style="width:5%">S.NO.</th><th style="width:30%">ITEMS</th><th style="width:8%">HSN</th>
      <th style="width:8%">BAGS</th><th style="width:10%">QTY.</th><th style="width:14%">RATE</th>
      <th style="width:8%">TAX</th><th style="width:17%">AMOUNT</th>
    </tr></thead>
    <tbody>${itemRows}
      <tr style="height:40px"><td class="b"></td><td class="b"></td><td class="b"></td><td class="b"></td><td class="b"></td><td class="b"></td><td class="b"></td><td class="b"></td></tr>
    </tbody>
    <tfoot><tr class="tr">
      <td class="b c" colspan="4">TOTAL</td>
      <td class="b r">${totalQty}</td><td class="b"></td>
      <td class="b c">₹ ${formatCurrency(totalTax)}</td>
      <td class="b r">₹ ${formatCurrency(totalAmount)}</td>
    </tr></tfoot>
  </table>
  <div class="aw">Total Amount (in words): ${invoice.amount_in_words||numberToWords(Math.floor(totalAmount))}</div>
  <table>
    <thead><tr><th>HSN/SAC</th><th>Taxable Value</th><th>IGST Rate</th><th>IGST Amount</th></tr></thead>
    <tbody>${hsnRows}</tbody>
    <tfoot><tr class="tr"><td class="b c" colspan="2"><b>Total Tax Amount</b></td><td class="b"></td><td class="b r"><b>₹ ${formatCurrency(totalTax)}</b></td></tr></tfoot>
  </table>
  <div class="bg">
    <div class="bk">
      <div class="st">Bank Details</div>
      <div class="fl"><b>Name:</b> ${company.bank_holder_name||company.name}</div>
      <div class="fl"><b>IFSC Code:</b> ${company.bank_ifsc||'-'}</div>
      <div class="fl"><b>Account No:</b> ${company.bank_account||'-'}</div>
      <div class="fl"><b>Bank:</b> ${company.bank_name||'-'}</div>
    </div>
    <div class="as">
      <div class="ar"><span>Total Amount:</span><span>₹ ${formatCurrency(totalAmount)}</span></div>
      <div class="ar"><span>Received:</span><span>₹ ${formatCurrency(invoice.received_amount||0)}</span></div>
      <div class="ar t"><span>Balance Due:</span><span>₹ ${formatCurrency(totalAmount-Number(invoice.received_amount||0))}</span></div>
    </div>
  </div>
  <div class="tm">
    <h4>Terms and Conditions:</h4>
    <ol><li>Goods once sold will not be taken back or exchanged</li><li>All disputes are subject to Agra jurisdiction only</li></ol>
  </div>
  <div class="sg"><div class="sn">For ${company.name}</div><br/><br/><div class="sl">Authorised Signatory</div></div>
</div></body></html>`;
}
