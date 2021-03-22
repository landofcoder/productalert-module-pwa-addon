import React, {Fragment} from 'react';
import {string, number, shape} from 'prop-types';
import {Link, resourceUrl} from '@magento/venia-drivers';
import {Price} from '@magento/peregrine';
import {transparentPlaceholder} from '@magento/peregrine/lib/util/images';
import {UNCONSTRAINED_SIZE_KEY} from '@magento/peregrine/lib/talons/Image/useImage';

import {mergeClasses} from '@magento/venia-ui/lib/classify';
import Image from '@magento/venia-ui/lib/components/Image';
import defaultClasses from '@magento/venia-ui/lib/components/Gallery/item.css';
import {useNotifyGalleryItem} from "./useNotifyGalleryItem";
import {InsightMessage} from "../General/InsightMessage";
import {Popup} from "../General/Popup";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator/indicator";

// The placeholder image is 4:5, so we should make sure to size our product
// images appropriately.
const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 375;

// Gallery switches from two columns to three at 640px.
const IMAGE_WIDTHS = new Map()
    .set(640, IMAGE_WIDTH)
    .set(UNCONSTRAINED_SIZE_KEY, 840);

const ItemPlaceholder = ({classes}) => (
    <div className={classes.root_pending}>
        <div className={classes.images_pending}>
            <Image
                alt="Placeholder for gallery item image"
                classes={{
                    image: classes.image_pending,
                    root: classes.imageContainer
                }}
                src={transparentPlaceholder}
            />
        </div>
        <div className={classes.name_pending}/>
        <div className={classes.price_pending}/>
    </div>
);

const GalleryItem = props => {
    const {item} = props;

    const classes = mergeClasses(defaultClasses, props.classes);

    const {
        data,
        shouldShowNotification,
        print,
        showPopup,
        popupData,
        messageType,
        message,
        setShowPopup,
        button_text,
        handlePress,
        shouldMessageHaveMargin,
        globalLoading,
        isProductOutOfStock
    } = useNotifyGalleryItem({
        url_key: item ? item.url_key : null
    })

    if (!item) {
        return <ItemPlaceholder classes={classes}/>;
    }

    const {name, price, small_image, url_key, url_suffix} = item;
    const productLink = resourceUrl(`/${url_key}${url_suffix}`);

    return (
        <div className={classes.root}>
            <Link to={productLink} className={classes.images}>
                <Image
                    alt={name}
                    classes={{
                        image: classes.image,
                        root: classes.imageContainer
                    }}
                    height={IMAGE_HEIGHT}
                    resource={small_image}
                    widths={IMAGE_WIDTHS}
                />
            </Link>
            <Link to={productLink} className={classes.name}>
                <span>{name}</span>
            </Link>
            <div className={classes.price}>
                <Price
                    value={price.regularPrice.amount.value}
                    currencyCode={price.regularPrice.amount.currency}
                />
            </div>

            {isProductOutOfStock && (
                <div style={{marginTop: 17, marginBottom: 5, fontWeight: "bold", color: "grey", fontSize: 22}}>
                    <h4>Out of Stock</h4>
                </div>
            )}

            {!!shouldShowNotification && (
                <div style={{
                    marginTop: 10,
                    marginBottom: 30
                }}>
                    {!!button_text && (
                        <button onClick={handlePress}
                                style={{
                                    // backgroundColor: '#f14668',
                                    backgroundColor: '#28527a',
                                    borderRadius: 1,
                                    color: "white",
                                    fontWeight: 700,
                                    paddingLeft: 17,
                                    paddingRight: 17,
                                    paddingTop: 7,
                                    paddingBottom: 7
                                }}
                        >
                            {button_text}
                        </button>
                    )}
                </div>
            )}
            {!!message && !!messageType && <InsightMessage message={message}
                                                           messageType={messageType}
                                                           shouldHaveMargin={shouldMessageHaveMargin}
            />}
            {!!showPopup && popupData && <Popup popupData={popupData}
                                                showPopup={showPopup}
                                                setShowPopup={setShowPopup}
            />}
            {!!globalLoading && (<div style={{
                position: 'fixed', /* Stay in place */
                zIndex: 10, /* Sit on top */
                left: 0,
                top: 0,
                width: '100%', /* Full width */
                height: '100%', /* Full height */
                overflow: 'auto', /* Enable scroll if needed */
                backgroundColor: '#33333365', /* Fallback color */
            }}>
                <LoadingIndicator global={true}/>
            </div>)}
            {/*<h4>{print ? print : ''}</h4>*/}
        </div>
    );
};

GalleryItem.propTypes = {
    classes: shape({
        image: string,
        imageContainer: string,
        imagePlaceholder: string,
        image_pending: string,
        images: string,
        images_pending: string,
        name: string,
        name_pending: string,
        price: string,
        price_pending: string,
        root: string,
        root_pending: string
    }),
    item: shape({
        id: number.isRequired,
        name: string.isRequired,
        small_image: string.isRequired,
        url_key: string.isRequired,
        price: shape({
            regularPrice: shape({
                amount: shape({
                    value: number.isRequired,
                    currency: string.isRequired
                }).isRequired
            }).isRequired
        }).isRequired
    })
};

export default GalleryItem;
