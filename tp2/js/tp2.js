$(document).ready(function () {
    //Les variables utiles
    let confirmationDelay = 5000;		//compteur pour confirmer la commande (5s)
    let cart = [];
    let ventesTotales = 0;
    let actualPrices = {
        subtotal: 0, shipping: 0, total: 5,
    }
    // let userchoosed = false;
    let idCountdown = 0;

    const products = [
        {id: 1, name: "Casque audio sans fil !", price: 89.99, image: "images/casqueEcoute.jpg"},
        {id: 2, name: "Montre intelligente", price: 199.99, image: "images/montreIntelligente.jpg"},
        {id: 3, name: "Sac à dos pour ordinateur portable", price: 49.99, image: "images/sacAdos.jpg"},
        {id: 4, name: "Haut-parleur Bluetooth", price: 59.99, image: "images/hautParleur.jpg"},
        {id: 5, name: "Téléphone intelligent", price: 699.99, image: "images/telephoneIntelligent.jpg"},
        {id: 6, name: "Bracelet de suivi d’activité", price: 79.99, image: "images/bracelet.jpg"}
    ];


    /**
     * Crée un produit pour mettre dans la division cart-items.
     * @param item Le produit à afficher dans le cart.
     * @returns {string} le code html correspondant au porduit
     */
    function createCartItem(item) {
        const itemHtml = `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">${item.price.toFixed(2)} $</div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item.id}">+</button>
                            <button class="remove-item" data-id="${item.id}">×</button>
                        </div>
                    </div>`;
        return itemHtml;
    }

    /**
     * Crée un produit pour mettre dans la division products-container.
     * @param item Les données de l'item
     * @returns {string} le code html correspondant au porduit
     */
    function createProduct(product) {
        const card = `
                <div class="product-card" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <div class="product-title">${product.name}</div>
                        <div class="product-price">${product.price.toFixed(2)} $</div>
                        <button class="add-to-cart" data-id="${product.id}">Ajouter au panier</button>
                    </div>
                </div>`;
        return card;
    }


    function initStore() {
        // S'il y a des items dans la mémoire du navigateur
        cart = JSON.parse(localStorage.getItem("cart")) || [];
        ventesTotales = parseInt(localStorage.getItem("ventesTotales")) || 0;

        // On enregistre le panier avant de fermer la fenetre de l'applicaiton
        $(window).on("beforeunload", () => {
            localStorage.setItem("cart", JSON.stringify(cart));
            localStorage.setItem("ventesTotales", ventesTotales);

        });

        /* TODO
            - affiche les ventes totales
            - affiche tous les produits disponibles en appelant la méthode renderProducts
            - appelle la méthode pour mettre à jour l'affichage du cart.
         */
        updateVentesTotal()
        renderProducts();
        updateCartDisplay();
        $(".add-to-cart").click(function () {
            addToCart($(this).attr("data-id"));
            updateCartDisplay();
        });
    }

    /**
     * Configure les boutons de la page (checkout-btn, checkout-confirmation, cancel-checkout,
     * cart-button, clear-total )
     *
     */
    function configureButtons() {
        $("#checkout-btn").click(function () {
            checkout();
        });

        $("#checkout-confirmation").click(function () {
            ventesTotales += actualPrices.total;
            updateVentesTotal()
            $("#order-confirmation").fadeOut();
            clearCart();
        });
        $("#cancel-checkout").click(function () {
            $("#order-confirmation").fadeOut();
            clearCart();
        });


        $("#cart-button").click(function () {
            $(".cart-section").toggle();
        });

        $("#clear-total").click(function () {
            ventesTotales = 0;
            updateVentesTotal()
        });
    }


    /**
     * Affiche les produits disponibles dans la section centrale de la page.
     */
    function renderProducts() {
        products.forEach(prod => {
            const prodhtml = createProduct(prod);
            $("#products-container").append(prodhtml);
        });
    }

    /**
     * Ajoute un porduit dans le cart.
     * @param productId l'id du porduit à ajouter.
     */
    function addToCart(productId) {
        const prodAjout = products[productId - 1];
        const itemToAdd = {
            id: prodAjout.id,
            image: prodAjout.image,
            name: prodAjout.name,
            price: prodAjout.price,
            quantity: 1
        };
        let itemDoitEtreAjouter = true;
        cart.forEach(cartItem => {
            if (cartItem.id === itemToAdd.id) {
                cartItem.quantity += 1;
                itemDoitEtreAjouter = false;
            }
        });
        if (itemDoitEtreAjouter) {
            cart.push(itemToAdd);
        }
        console.log('ajout de ---------' + itemToAdd.name);
        $(".cart-count").css({
            transition: 'transform 300ms ease-in-out',
            transform: 'scale(1.5)'
        });
        setTimeout(() => {
            $(".cart-count").css({
                transform: 'scale(1)'
            });
        }, 300);
    }


    /**
     * Met à jour le nombre d'item dans le cart.
     */
    function updateCartCount() {
        let nb = 0;
        cart.forEach(item => nb += item.quantity);
        $(".cart-count").text(nb);

    }

    /**
     * Calcule les trois prix du cart: subtotal, shipping et total.
     * @returns {{subtotal: number, shipping: number, total: *}}
     */
    function calculatePrices() {
        let prix = 0;
        let ship = 5;
        cart.forEach(item => prix += item.price);
        if (cart.length < 1) {
            ship = 0;
        }
        return {subtotal: prix, shipping: ship, total: prix + ship};
    }


    /**
     * Met à jour l'affichage du cart. Elle vous est gracieusement offerte!
     */
    function updateCartDisplay() {
        const cartContainer = $('#cart-items');

        updateCartCount()
        actualPrices = calculatePrices();
        updatePrice(actualPrices);

        if (cart.length === 0) {
            cartContainer.html('<div class="empty-cart">Votre panier est vide</div>');
            $('#checkout-btn').prop('disabled', true).css('opacity', '0.6');
        } else {
            cartContainer.empty();
            $('#checkout-btn').prop('disabled', false).css('opacity', '1');

            cart.forEach(item => {
                const itemHtml = createCartItem(item);
                cartContainer.append(itemHtml);
            });
            $('.decrease').on('click', e => changeQuantity(e, -1));
            $('.increase').on('click', e => changeQuantity(e, 1));
            $('.remove-item').on('click', e => removeItem(e));
        }
    }

    /**
     * Met à jour les prix dans l'interface utilisateur.
     * @param prices
     */
    function updatePrice(prices) {
        let mod = 0;//modificateurPrixPourAnnulerLivraisonDansTotal
        $("#subtotal").text((Math.round(prices.subtotal * 100) / 100) + ' $');
        $("#shipping").text((Math.round(prices.shipping * 100) / 100) + ' $');
        $("#total").text((Math.round((prices.total - mod) * 100) / 100) + ' $');
    }

    /**
     *     Ajoute ou retire 1 à la quantité du produit sur lequel on vient de cliquer.
     * @param event l'événement
     * @param delta + ou - 1
     */
    function changeQuantity(event, delta) {

        let itemID = event.target.dataset.id;
        cart.forEach(item => {
            if (item.id == itemID) {
                item.quantity += delta;
                if (item.quantity == 0) {
                    removeItem(event);
                }
            }
        });
        updateCartDisplay();
    }

    /**
     * Retire du cart le produit sur lequel on vient de cliquer.
     * @param event
     */
    function removeItem(event) {
        let tempTable = [];
        console.log(event);
        let itemID = event.target.dataset.id;
        console.log(itemID);
        cart.forEach(item => {
            if (item.id != itemID) {
                tempTable.push(item);
            }
        });
        cart = tempTable;
        updateCartDisplay();
    }

    /**
     * Efface le contenu du cart et mets à jour l'affichage de ce dernier.
     */
    function clearCart() {
        cart = [];
        updateCartDisplay();
    }

    /**
     * Confirme ou infirme l'achat des produits dans le cart.
     */
    function checkout() {
        if (cart.length > 0) {
            $("#order-confirmation").fadeIn();
            // $("#order-confirmation").FadeIn(0).delay(confirmationDelay).fadeOut();
            // set timer
            // clearCart()
            $("#confirmation-delay").text(5);
            let tempsRestant = (confirmationDelay / 1000) - 1;
            const interval = setInterval(() => {
                $("#confirmation-delay").text(tempsRestant);
                console.log(tempsRestant);
                tempsRestant--;
                if (tempsRestant === -1) {
                    clearInterval(interval);
                    $("#order-confirmation").fadeOut();
                }
            }, 1000);
        }
    }

    function updateVentesTotal() {
        $("#depenses-totales").text(Math.round(ventesTotales * 100) / 100);
    }


    initStore();
    configureButtons();
});
