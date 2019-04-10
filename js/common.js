var url = 'https://petshop-3dc65.firebaseio.com/';
var produse = {};
var listaCos = {};
var produsCos = {};
var tipMancare;
var slideIndex = 0;
var cantitateInCos;



function startSpinner() {
    document.getElementById('spinner').style.display = 'block';
}

function stopSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

async function ajax(method, url, body) {
    return new Promise(function (resolve, reject) {
        startSpinner();
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    stopSpinner();
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject(new Error("serverul a dat eroare"));
                }
            }
        };
        xhttp.open(method, url, true);
        xhttp.send(body);
    });
}


function getProducts() {

    ajax("GET", url + '/produse.json')
        .then(function (raspuns) {
            products = raspuns;
            showProducts();
        })
        .then(function () {
            getCartNbOfItems('');
        })

        .catch(function (err) {
            console.error(err);
        });
}

function showProducts() {
    var str = "";
    for (var i in products) {
        if (!products.hasOwnProperty(i)) {
            continue;
        }
        if (products[i] === null) {
            continue;
        }
        str += `
       
        <div class = 'col-xs-12 col-sm-4 col-md-4 col-lg-3'  id='details'>
            <a href="details.html?productID=${i}">      
                <div class = 'productDescription'>    
                    <img class = "productImage" src = ${products[i].Image} />
                    <div class = "productName">${products[i].Name}</div>
                    <br>
                    <div class = "productPrice">${products[i].Price}&nbsp;RON</div>
                    <button id='btnDetails' class = "btnDetails" >Detalii</button>
                </div>   
            </a>
        </div>`
    }
    document.getElementById('main').innerHTML = str;
   
}

function getProductIDFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var productID = params.get('productID');

    return productID;
}

/*async function getDetails(productID) {
    var detailsResponse = await fetch(`${url}${productID}.json`);  // preiau inf din bd
    var details = await detailsResponse.json();   //returneaza un obiect

    return details;
}
*/


/** detaliile produsului selectat in pagina de index */
function getDetails(productID, refreshPage) {
    ajax("GET", `${url}/produse/${productID}.json`)
        .then(function (raspuns) {
            productDetails = raspuns;
            if (refreshPage) {
                showDetails(productDetails);
            }
        })
        .then(function () {
            if (refreshPage) {
                getCartNbOfItems('');
            }
        })
        .catch(function (err) {
            console.error(err);
        });
}

async function showDetails(detailsPromise) {

    if (detailsPromise!=null){
       
        startSpinner();
        var details =  await detailsPromise;

        document.querySelector("#detailsProductImg").src = details.Image;
        document.querySelector("#nameBrand").innerHTML = details.Name;
        document.querySelector("#detailsProductDetail").innerHTML = details.Details;
        document.querySelector("#detailsProductPrice").innerHTML = details.Price + ' RON';
        if (details.Qty > 0) {
            if (details.Qty<5){
                document.querySelector("#disponibil").innerHTML = 'Stoc limitat';
            } else {
                document.querySelector("#disponibil").innerHTML = 'In stoc';
            }
            document.querySelector("#disponibil").style.color = '#7d09ed';
            document.querySelector("#disponibil").style.fontWeight = 'bold'
        } else {
            document.querySelector("#disponibil").innerHTML = 'Indisponibil';
            document.querySelector("#disponibil").style.color = 'red';
            document.querySelector("#addToCart").disabled=true;
            document.querySelector("#addToCart").style.backgroundColor='darkgrey';
        }
        document.querySelector("#disponibil").style.fontWeight = 'bold';

        tipMancare = details.Tip

        stopSpinner();
        document.querySelector('#productDetails').style.display = "flex";
    } else{
        //daca e null inseamna ca vine din pagina de cos, a dat click pe un produs pe care l-a sters admin-ul
        document.getElementById('productDetails').style.display = "none";
        document.getElementById('detailsProductShop').style.display = "none";

        document.getElementById('userMessage').innerHTML = 'Produsul nu mai face parte din oferta noastra!'
        document.getElementById('userMessage').style.display = "block";
}



    getSlides(); 
    
}

function getCartNbOfItems() {
    var nbOfItems=0;
    var cartList = JSON.parse(localStorage.getItem('cart'));
    if (cartList == null) {
        document.getElementById('cartItems').innerHTML = ' (0)';
    } else {
            for (var i in cartList){
                nbOfItems+=cartList[i].qty;
            }

        //document.getElementById('cartItems').innerHTML = ` (${cartList.length})`;
        document.getElementById('cartItems').innerHTML = `(${nbOfItems})`;
        return nbOfItems;
    }

}

function showCart() {
    let counter = 0
    for (var i in listaCos) {
        if (!listaCos.hasOwnProperty(i)) {
            continue;
        }
        if (listaCos[i] === null) {
            continue;
        }
        counter++;
    }
    document.getElementById('cartItems').innerHTML = ` (${counter})`;
}

function showHideMap(){
    if (document.getElementById('ifrm').style.display==='block'){
        document.getElementById('ifrm').style.display='none';
    }else{
        document.getElementById('ifrm').style.display='block';
    }
}


