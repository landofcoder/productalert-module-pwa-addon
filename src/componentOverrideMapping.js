/**
 * Mappings for overwrites
 * example: [`@magento/venia-ui/lib/components/Main/main.js`]: './lib/components/Main/main.js'
 */
module.exports = componentOverride = {
    [`@magento/venia-ui/lib/components/ProductFullDetail/productFullDetail.js`]: '@landofcoder/productalert-module/src/override/ProductDetail/productFullDetail.js',
    [`@magento/venia-ui/lib/components/Gallery/item.js`]: '@landofcoder/productalert-module/src/override/ProductListing/GalleryItem.js',
    ['@magento/venia-ui/lib/components/AccountMenu/accountMenuItems.js']: '@landofcoder-/productalert-module/src/override/MyAccount/AccountMenuItems.js'
};
