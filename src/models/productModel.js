const db = require('../config/database');

class ProductModel {
    getAllProducts() {
        return new Promise((resolve, reject) => {
            const productQuery = 'SELECT * FROM Products';
            const imageQuery = 'SELECT ImageFilename FROM ProductImages WHERE ProductID = ?'; 

            db.query(productQuery, (productError, productResults) => {
                if (productError) {
                    console.error('Error fetching products:', productError);
                    return reject(productError);
                }
        
                // We now need to fetch the first image for each product
                const productsWithImages = [];
    
                const fetchImagesForProducts = productResults.map(product => {
                    return new Promise((resolveImage, rejectImage) => {
                        db.query(imageQuery, [product.ID], (imageError, imageResults) => {
                            if (imageError) {
                                console.error(`Error fetching images for product ${product.ID}:`, imageError);  
                                return rejectImage(imageError);
                            }
    
                            product.ImageFilename = imageResults.map(image => image.ImageFilename);
    
                            productsWithImages.push(product);

                            resolveImage();
                        });
                    });
                });
    
                // Wait for all image fetches to complete
                Promise.all(fetchImagesForProducts)
                    .then(() => {
                        resolve(productsWithImages); 
                    })
                    .catch(imageError => {
                        reject(imageError); 
                    });
            });
        });
    }

    getProductById(productId) {
        return new Promise((resolve, reject) => {
            const productQuery = 'SELECT * FROM Products WHERE id = ?';
            const imagesQuery = 'SELECT ImageFilename FROM ProductImages WHERE ProductID = ?';

            db.query(productQuery, [productId], (productError, productResults) => {
                if (productError) {
                    return reject(productError);
                }

                db.query(imagesQuery, [productId], (imagesError, imagesResults) => {
                    if (imagesError) {
                        return reject(imagesError);
                    }

                    const product = productResults[0];
                    product.images = imagesResults.map((image) => image.ImageFilename);

                    resolve(product);
                });
            });
        });
    }
}

module.exports = new ProductModel();
