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
            document.querySelector("#disponibil").innerHTML = 'In stoc';
            document.querySelector("#disponibil").style.color = '#B9C406';
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

/* function getCart(productID) {
      if (productID == '') {
           ajax("GET", `${url}cos.json`)
               .then(function (raspuns) {
                   listaCos = raspuns;
                   showCart();
               })
               .catch(function (err) {
                   console.error(err);
               });
       } else {
           ajax("GET", `${url}cos/${productID}.json`)
               .then(function (resolve) {
                   objProdusCos = resolve;
                   if (objProdusCos != null) {
                       cantitateInCos = objProdusCos.Qty;
                   } else {
                       cantitateInCos = 0;
                   }
               })
               .then(function () {
                   getDetails(productID, false);
               })
               .then(function () {
                   saveToCart(productID);
               })
               .catch(console.error);
       }
   */
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








 /*function saveToCart(productID) {
    let selectedQty;
    selectedQty = parseInt(document.getElementById('txtCantitate').value);

    //verific stocul produsului
     cantitateInCos += selectedQty;
           if (productDetails.Qty < selectedQty) {
               //stocul mai mic decat cantitatea introdusa
               alert('Cantinatea solicitata depaseste stocul produsului! \n\n  Va rugam sa introduceti o cantitate mai mica!')
           } else if (productDetails.Qty < cantitateInCos) {
               alert('Cantinatea totala solicitata depaseste stocul produsului! \n\n  Va rugam sa introduceti o cantitate mai mica!')

           } else {
               produsCos = {
                   Name: productDetails.Name,
                   Qty: cantitateInCos,
                   Price: productDetails.Price,
                   Image: productDetails.Image
               }

               //dc nu exista in cos nu dau cu POST ca imi pune el id-ul lui si eu vreau ID-ul produsului pe care l-a adaugat in cos
               ajax("PUT", `${url}cos/${productID}.json`, JSON.stringify(produsCos))
                   .then(function (resolve) {
                       if (resolve) {
                           document.getElementById('adToCartMessage').innerHTML = productDetails.Name + ' a fost adaugat in cos!'
                           document.getElementById('adToCartMessage').style.display = "block";
                           setTimeout(() => {
                               document.getElementById('adToCartMessage').style.display = "none";
                           }, 2000);
                       }
                   })
                   .then(function () {
                       getCart('');
                   })

                   .catch(function (err) {
                       console.error(err);
                   });
                }
            }
    
 */