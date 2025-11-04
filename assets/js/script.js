    
    // All your same variables and logic...
    const companyNameInput=document.getElementById("companyName");
    const companyAddressInput=document.getElementById("companyAddress");
    const clientNameInput=document.getElementById("clientName");
    const clientEmailInput=document.getElementById("clientEmail");
    const clientPhoneInput=document.getElementById("clientPhone");
    const clientAddressInput=document.getElementById("clientAddress");
    const taxInput=document.getElementById("tax");
    const discountInput=document.getElementById("discount");
    const currencySelect=document.getElementById("currency");
    const itemsContainer=document.getElementById("itemsContainer");
    const invoiceContainer=document.getElementById("invoice");
    const invoiceItemsBody=document.getElementById("invoiceItems");
    const advanceInput=document.getElementById("advanceInput");
    const dueInput=document.getElementById("dueInput");
    const subtotalEl=document.getElementById("subtotal");
    const taxAmountEl=document.getElementById("taxAmount");
    const discountAmountEl=document.getElementById("discountAmount");
    const grandTotalEl=document.getElementById("grandTotal");
    const advanceTotalEl=document.getElementById("advanceTotal");
    const dueTotalEl=document.getElementById("dueTotal");
    const currencySpans=["curSubtotal","curTax","curDiscount","curGrand","curAdvance","curDue"].map(id=>document.getElementById(id)).filter(Boolean);
    const displayCompanyName=document.getElementById("displayCompanyName");
    const displayCompanyAddress=document.getElementById("displayCompanyAddress");
    const displayClientName=document.getElementById("displayClientName");
    const displayClientEmail=document.getElementById("displayClientEmail");
    const displayClientPhone=document.getElementById("displayClientPhone");
    const displayClientAddress=document.getElementById("displayClientAddress");
    const invoiceDate=document.getElementById("invoiceDate");
    const invoiceNumber=document.getElementById("invoiceNumber");
    const downloadBtn=document.getElementById("downloadBtn");

    function addItem(){
      itemsContainer.insertAdjacentHTML("beforeend",`
        <div class="item-row border rounded p-3 mb-3">
          <textarea class="form-control mb-3 desc" placeholder="Description" rows="2" required></textarea>
          <div class="row g-2">
            <div class="col-6"><input class="form-control qty" placeholder="Qty" type="number" min="0"></div>
            <div class="col-6"><input class="form-control price" placeholder="Price" type="number" min="0"></div>
          </div>
        </div>`);
    }

    function generateInvoice(){
      const currency=currencySelect.value;
      const name=clientNameInput.value.trim();
      const email=clientEmailInput.value.trim();
      const phone=clientPhoneInput.value.trim();
      const address=clientAddressInput.value.trim();
      const company=companyNameInput.value.trim();
      const compAddr=companyAddressInput.value.trim();
      const taxRate=parseFloat(taxInput.value)||0;
      const discount=parseFloat(discountInput.value)||0;
      let subtotal=0;
      invoiceItemsBody.innerHTML="";
      document.querySelectorAll(".item-row").forEach(row=>{
        const d=row.querySelector(".desc").value;
        const q=parseFloat(row.querySelector(".qty").value)||0;
        const p=parseFloat(row.querySelector(".price").value)||0;
        const t=q*p;
        subtotal+=t;
        invoiceItemsBody.insertAdjacentHTML("beforeend",`<tr><td>${d}</td><td>${q}</td><td>${p}</td><td>${t.toFixed(2)}</td></tr>`);
      });
      const tax=(subtotal*taxRate)/100;
      const grand=subtotal+tax-discount;
      const advance=parseFloat(advanceInput.value)||0;
      const due=grand-advance;
      displayCompanyName.textContent=company;
      displayCompanyAddress.textContent=compAddr;
      displayClientName.textContent=name;
      displayClientEmail.textContent=email;
      displayClientPhone.textContent=phone;
      displayClientAddress.textContent=address;
      invoiceDate.textContent=new Date().toLocaleDateString();
      invoNum = Math.floor(Math.random()*100000);
      invoiceNumber.textContent=invoNum;
      subtotalEl.textContent=subtotal.toFixed(2);
      taxAmountEl.textContent=tax.toFixed(2);
      discountAmountEl.textContent=discount.toFixed(2);
      grandTotalEl.textContent=grand.toFixed(2);
      advanceTotalEl.textContent=advance.toFixed(2);
      dueTotalEl.textContent=due.toFixed(2);
      currencySpans.forEach(s=>s.textContent=currency);
      invoiceContainer.style.display="block";
      downloadBtn.classList.remove("d-none");
    }

    // 🔥 Header/Footer/Watermark PDF Generator
    const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
    async function downloadPDF(){
        const { jsPDF } = window.jspdf;
        downloadBtn.classList.add("d-none");
        invoiceContainer.classList.add("pdf-export");
        const canvas = await html2canvas(invoiceContainer,{ scale:2, useCORS:true, backgroundColor:"#ffffff" });
        invoiceContainer.classList.remove("pdf-export");

        const [headerImg, footerImg, watermarkImg] = await Promise.all([
          loadImage("assets/img/header-img.png"),
          loadImage("assets/img/footer-img.png"),
          loadImage("assets/img/water-mark.png")
        ]);

        const pdf = new jsPDF("p","mm","a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const headerHeight = 30;
        const footerHeight = 25;
        const availableHeight = pageHeight - headerHeight - footerHeight;

        const fullImgWidth = pageWidth;
        let fullImgHeight = (canvas.height * fullImgWidth) / canvas.width;
        let renderWidth = fullImgWidth;

        if (fullImgHeight > availableHeight) {
          const scale = availableHeight / fullImgHeight;
          fullImgHeight = availableHeight;
          renderWidth = fullImgWidth * scale;
        }

        const xPos = (pageWidth - renderWidth) / 2;
        const yPos = headerHeight + Math.max((availableHeight - fullImgHeight)/2, 0);

        pdf.addImage(headerImg,"PNG",0,0,pageWidth,headerHeight);
        pdf.addImage(
          watermarkImg,
          "PNG",
          (pageWidth - 90)/2,
          (pageHeight - 90)/2,
          90,
          90,
          undefined,
          "FAST",
          0.1
        );
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          xPos,
          yPos,
          renderWidth,
          fullImgHeight,
          undefined,
          "FAST"
        );
        pdf.addImage(footerImg,"PNG",0,pageHeight - footerHeight,pageWidth,footerHeight);
        pdf.save( invoNum + "_invoice_.pdf" );
        downloadBtn.classList.remove("d-none");
      }