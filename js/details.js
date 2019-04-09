var slideIndex = 0;


/**
 * Functie care salveaza produsele in cosul de cumparaturi 
 * @param {productID}  
 * verifica daca cantitatea introdusa este mai mica decat cea din stoc
 * verifica cantitate introdusa + cea din cos (daca exista) sa nu depaseasca stocul
 * salvare detalii produs in localStorage
 */
function saveToCart(productID) {
    let selectedQty;
    selectedQty = parseInt(document.getElementById('txtCantitate').value);

    if (document.getElementById('txtCantitate').value == '') {
        document.getElementById('txtCantitate').classList.add('invalid');
    } else {
        document.getElementById('txtCantitate').classList.remove('invalid');

        if (productDetails.Qty < selectedQty) {
            //stocul mai mic decat cantitatea introdusa
            alert('Cantinatea solicitata depaseste stocul produsului! \n\n  Va rugam sa introduceti o cantitate mai mica!')

        } else {

            var cartList = JSON.parse(localStorage.getItem('cart'));
            if (cartList == null) {
                cartList = [];
            }

            index = cartList.findIndex((obj => obj.id == productID));

            if (index >= 0) {
                if (productDetails.Qty < selectedQty +  parseInt(cartList[index].qty)) {
                    //stocul mai mic decat cantitatea introdusa + cantitatea existenta deja in cos
                    alert('Cantitatea din cos si cea selectata depaseste stocul produsului! \n\n  Va rugam sa introduceti o cantitate mai mica!')
                    return;
                } else {
                    //salvez si un camp stare care imi va spune daca inregistrarea a fost modificata de admin
                    var newCartList = {
                        'id': productID,
                        'img': productDetails.Image,
                        'name': productDetails.Name,
                        'price': productDetails.Price,
                        'qty': selectedQty + parseInt(cartList[index].qty),
                        'stockQty': productDetails.Qty,
                        'stare':0
                    }
                    cartList.splice(index, 1, newCartList);
                }
            }
            else {
                cartList.push({
                    'id': productID,
                    'img': productDetails.Image,
                    'name': productDetails.Name,
                    'price': productDetails.Price,
                    'qty': selectedQty,
                    'stockQty': productDetails.Qty,
                    'stare':0
                });
            }

            localStorage.setItem('cart', JSON.stringify(cartList));
            document.getElementById('userMessage').innerHTML = productDetails.Name + ' a fost adaugat in cos!'
            document.getElementById('userMessage').style.display = "block";
            setTimeout(() => {
                document.getElementById('userMessage').style.display = "none";
            }, 1500);

            getCartNbOfItems();
        }
    }
}




/** Functie care preia din baza de date imaginile pentru carusel
 * daca detaliile se refera la hrana umeda, in carusel se afiseaza hrana uscata si invers
 */
function getSlides() {
    //https://petshop-3dc65.firebaseio.com/produse.json?orderBy=%22Tip%22&equalTo=%22Umeda%22

    tipMancare = ((tipMancare == 'Umeda') ? 'Uscata' : 'Umeda')
    //in cazul unui nr f mare de inregistrari, ar tb limitat numarul de inregistrari...aici nu e cazul
    ajax("GET", `${url}/produse.json?orderBy=%22Tip%22&equalTo="${tipMancare}"`)
        .then(function (raspuns) {
            lista = raspuns;
        })
        .then(function () {
            showSlides()
        })
}


function showSlides() {
    var str = '', strDots = '';

    for (var i in lista) {
        str += `
            <a href="details.html?productID=${i}"><div class="mySlides fade"> 
                 <img src = ${lista[i].Image} style="width:100%" />
             </div></a>
             `
        strDots += `<span class="dot"></span> `

    }

    document.getElementsByClassName("slideshow-container")[0].innerHTML = str;
    document.getElementById('dots').innerHTML = strDots;

    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1 }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
    setTimeout(showSlides, 2000); // schimb imaginea din 2 in 2 secunde
}

