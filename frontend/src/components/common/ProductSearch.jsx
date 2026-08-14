import "../../styles/search.css";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

function ProductSearch({ selectedProduct, onSelect }) {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showResults, setShowResults] = useState(false);

    const searchRef = useRef(null);

    // --------------------------------------------------
    // LOAD PRODUCTS
    // --------------------------------------------------
    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);

                const response = await fetch(
                    "/api/products/"
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load products"
                    );
                }

                const data = await response.json();

                console.log(
                    "PRODUCTS FROM API:",
                    data
                );

                setProducts(data);
            } catch (error) {
                console.error(
                    "Error loading products:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    // --------------------------------------------------
    // CLOSE RESULTS WHEN CLICKING OUTSIDE
    // --------------------------------------------------
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                searchRef.current &&
                !searchRef.current.contains(
                    event.target
                )
            ) {
                setShowResults(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // --------------------------------------------------
    // FILTER PRODUCTS
    // --------------------------------------------------
    const searchValue = search
        .trim()
        .toLowerCase();

    const filteredProducts =
        searchValue.length === 0
            ? []
            : products.filter((product) => {
                  const sku = String(
                      product.sku || ""
                  ).toLowerCase();

                  const name = String(
                      product.name || ""
                  ).toLowerCase();

                  return (
                      sku.includes(searchValue) ||
                      name.includes(searchValue)
                  );
              });

    // --------------------------------------------------
    // SELECT PRODUCT
    // --------------------------------------------------
    function handleSelect(product) {
        console.log(
            "PRODUCT SELECTED:",
            product
        );

        console.log(
            "PRODUCT ID:",
            product.id
        );

        setSearch("");
        setShowResults(false);

        onSelect(product);
    }

    // --------------------------------------------------
    // CLEAR PRODUCT
    // --------------------------------------------------
    function handleClear() {
        setSearch("");
        setShowResults(false);

        onSelect(null);
    }

    return (
        <div
            className="product-search-container"
            ref={searchRef}
        >
            {selectedProduct ? (
                <div className="selected-product">
                    <div className="selected-product-info">
                        <strong>
                            {selectedProduct.sku}
                        </strong>

                        <span>
                            {selectedProduct.name}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="clear-product-btn"
                        onClick={handleClear}
                        title="Change product"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <div className="product-search-wrapper">
                    <div className="product-search-input-wrapper">
                        <Search
                            size={20}
                            className="product-search-icon"
                        />

                        <input
                            type="text"
                            value={search}
                            placeholder={
                                loading
                                    ? "Loading products..."
                                    : "Search SKU or product name..."
                            }
                            disabled={loading}
                            autoComplete="off"
                            onChange={(e) => {
                                setSearch(
                                    e.target.value
                                );

                                setShowResults(true);
                            }}
                            onFocus={() => {
                                if (
                                    search.trim()
                                ) {
                                    setShowResults(
                                        true
                                    );
                                }
                            }}
                        />
                    </div>

                    {showResults &&
                        search.trim() && (
                            <div className="product-search-results">
                                {filteredProducts.length ===
                                0 ? (
                                    <div className="product-search-message">
                                        No products found.
                                    </div>
                                ) : (
                                    filteredProducts
                                        .slice(0, 30)
                                        .map(
                                            (
                                                product
                                            ) => (
                                                <button
                                                    type="button"
                                                    key={
                                                        product.id
                                                    }
                                                    className="product-search-result"
                                                    onClick={() =>
                                                        handleSelect(
                                                            product
                                                        )
                                                    }
                                                >
                                                    <strong>
                                                        {
                                                            product.sku
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            product.name
                                                        }
                                                    </span>
                                                </button>
                                            )
                                        )
                                )}
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}

export default ProductSearch;