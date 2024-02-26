const db = require('../config/database');

class ProductModel {
    getAllProducts() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM products';
            db.query(query, (error, results, fields) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    getProductById(productId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM products WHERE id = ?';
            db.query(query, [productId], (error, results, fields) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });
    }
}

module.exports = new ProductModel();
