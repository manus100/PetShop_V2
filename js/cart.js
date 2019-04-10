var str;
var transport = 10;
var TVA = 19;
var arr = [];
var cartUpdated;

/**Functie care returneaza lista cu produsele din cos
 * 
 */
function getCartList() {
    var cartList = JSON.parse(localStorage.getItem('cart'));
    document.querySelector("#cartTable").style.display = 'none';
    if (cartList == null || cartList.length === 0) {
        //nu exista produse in cos
        document.querySelector('.pageTitle.cartTitle').innerHTML = 'Nu exista produse in cos!'
        document.querySelector('#cartContent').style.display = 'none';
        document.getElementById('userMessage').style.display = "none";
    } else {
        startSpinner();
        document.querySelector('#cartContent').display = '';
        document.querySelector("#cartTable").style.display = '';
        showCartList(cartList);
        showTotal(cartList);
        stopSpinner();
    }
    return cartList;
}

function showCartList(lista) {
    str = "";
    cartUpdated = 0;

    for (var i in lista) {
        if (!lista.hasOwnProperty(i)) {
            continue;
        }
        if (lista[i] === null) {
            continue;
        }

        if (lista[i].stare == 1) {
            cartUpdated = 1;
        }
        //daca admin-ul a modificat un produs, colorez inregistrarea cu rosu si afisez un mesaj utilizatorului (un title)
        str += `
        <tr ${((lista[i].stare == 1) ? "style='background-color:#FE7478;' title='Produs modificat de administratorul site-ului, va rugam verificati detaliile!'" : '')}>
            <td >
                <a href="details.html?productID=${lista[i].id}" class="linkProductName">
                    ${lista[i].name}
                </a>
            </td>
            <td class="cartField"><span>${lista[i].price}</span></td>
            <td class="cartFieldQty" >
                <span style="float: left;">
                    <button class="cartBtns" "float: left;" onclick="substractQty('${i}');">-</button>
                </span>
                <span style="float: center;">${lista[i].qty}</span>
                <span style="float: right;">    
                    <button class="cartBtns" "float: right;" onclick="addQty('${i}');">+</button>
                </span>
            </td>
            <td class="cartField"><span>${calculateSubtotal(lista[i].qty, lista[i].price).toFixed(2)}</span></td>
            <td style="white-space:nowrap;">
                <div class="cartField cartBtns" onclick="removeCartItem('${i}');">Sterge</div>
            </td>
        </tr>
    `;
    }

    document.querySelector("#cartTable tbody").innerHTML = str;

}

function calculateSubtotal(qty, price) {
    return subTotal = Number(qty * price)
}

function showTotal(lista) {

    calculateTotal(lista);
    str = `
        <p>Nr. produse: ${getCartNbOfItems('')}</p>
        <p>TVA: ${arr[0]} RON</p>
        <p>Transport: ${transport} RON</p>
        <h3>Total: ${arr[1]} RON</h3>
        <button id="buyBtn" class='btnDetails' onclick='buyProducts();'><img src='img\\RedArrow.png' id="imgBuy">Cumpara</button> 
    `
    document.querySelector("#contentRight").innerHTML = str;

    if (cartUpdated) {
        document.getElementById('userMessage').innerHTML = 'Produsele marcate au fost modificate de administratorul site-ului. Va rugam sa refaceti comanda!'
        document.getElementById('userMessage').style.display = "block";
       
        document.querySelector("#buyBtn").disabled = true;
        document.querySelector("#buyBtn").style.color="grey";
    } else {
        document.getElementById('userMessage').style.display = "none";
        document.querySelector("#buyBtn").style.color="white";
        document.querySelector("#buyBtn").disabled = false;
    }
}



function calculateTotal(lista) {
    var total = 0;
    var tva = 0;
    arr = [];
    for (var i in lista) {
        total += calculateSubtotal(lista[i].qty, lista[i].price);
    }
    tva = total * (TVA / 100);
    arr.push(tva.toFixed(2));
    total += tva + transport;
    arr.push(total.toFixed(2));
    //return total.toFixed(2);
    return arr;
}


function addQty(idx) {
    let lista = JSON.parse(localStorage.getItem('cart'));

    if (lista[idx].qty < lista[idx].stockQty) {
        lista[idx].qty++;
        //nu ar tb actualizat local storage????
        localStorage.cart = JSON.stringify(lista);
        refreshPage(lista);
        getCartNbOfItems('');
    } else {
        document.getElementById('userMessage').innerHTML = 'Cantitatea selectata depaseste stocul produsului!'
        document.getElementById('userMessage').style.display = "block";
        setTimeout(() => {
            document.getElementById('userMessage').style.display = "none";
        }, 2000);
    }

}


function substractQty(idx) {
    let lista = JSON.parse(localStorage.getItem('cart'));

    if (lista[idx].qty > 1) {
        lista[idx].qty--;
        localStorage.cart = JSON.stringify(lista);
        refreshPage(lista);
        getCartNbOfItems('');
    } else {
        //cantitate 0, ar tb scos de tot din lista
        removeCartItem(idx);
    }
}

function removeCartItem(idx) {
    let lista = JSON.parse(localStorage.getItem('cart'));
    if (confirm(`Sunteti sigur ca doriti stergerea produsului ${lista[idx].name} din cos?`)) {
        lista.splice(idx, 1);
        //dc a sters ultimul produs din cos ascund tabelul si totalul
        if (lista.length > 0) {
            refreshPage(lista);
        } else {
            localStorage.clear();
            getCartList();
        }
        getCartNbOfItems('');
    }
}

function refreshPage(lista) {
    localStorage.cart = JSON.stringify(lista);
    showCartList(lista);
    showTotal(lista)
}

/**Functie care salveaza continutul localStorage in tabela cos
 * sterg intai inregistrarile din tabela cos (daca exista)
 * pentru fiecare produs din cos verific intai ca nu s-a schimbat cantitatea din stoc sau pretul
 * daca au intervenit modificari atentionez utilizatorul (inrosesc produsele modificate de admin)
 * daca nu au intervenit modificari salvez continutul localStorage in cos
 * actualizez stocul produselor comandate in tabela produse
 * sterg localStorage
 */
async function buyProducts() {
    const el = {};

    //verific intai tabela cos ca nu are inregistrari; daca are, le sterg
    listaCos = await ajax("GET", url + '/cos.json');

    if (listaCos != null) {
        await ajax("DELETE", url + '/cos.json');
    }

    listaCos = JSON.parse(localStorage.getItem('cart'));

    //folosesc PUT ca sa imi salveze cu id-ul din produs
    for (var i = 0; i < listaCos.length; i++) {
        //salvez in tabela cos, doar daca cantitatea e diferita de 0
        if (listaCos[i].qty != 0) {
            await ajax("PUT", `${url}cos/${listaCos[i].id}.json`, JSON.stringify(listaCos[i]));
            produs = await ajax("GET", `${url}/produse/${listaCos[i].id}.json`);
            //actualizez stocul
            el.Details = produs.Details;
            el.Image = produs.Image;
            el.Name = produs.Name
            el.Price = produs.Price;
            el.Qty = produs.Qty - listaCos[i].qty;
            el.Tip = produs.Tip;

            //actualizez stocul produsului
            await ajax("PUT", `${url}produse/${listaCos[i].id}.json`, JSON.stringify(el));
        }

    }

    //golesc localStorage (si daca comanda nu a putut fi plasata ca sa il fortez sa o refaca)
    localStorage.clear();

    //actualizez interfata
    getCartList();
    getCartNbOfItems('');

    //mesaj utilizator comanda a fost plasata
    document.getElementById('userMessage').innerHTML = 'Comanda a fost plasata!'
    document.getElementById('userMessage').style.display = "block";
    document.querySelector('.pageTitle.cartTitle').style.display="none";
    
    setTimeout(() => {
        document.getElementById('userMessage').style.display = "none";
        document.querySelector('.pageTitle.cartTitle').style.display="block";
    }, 2000);


    //    }
}



