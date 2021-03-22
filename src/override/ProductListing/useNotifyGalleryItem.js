import {gql, useLazyQuery, useMutation, useQuery} from "@apollo/client";
import {useEffect, useState} from "react";
import {useUserContext} from "@magento/peregrine/lib/context/user";

const productAlertQuery = gql`
query($url_key: String!){
  products( filter: {url_key:{eq: $url_key}}){
    items{
      mp_productalerts_stock_notify
      stock_status
      sku
    }
  }
}`

const alertConfigQuery = gql`
query{
  MpProductAlertsConfigs{
    general{
      custom_css
    }
    stock_alert{
      button_text
      show_listing_page
      subscribed_text
      popup_setting{
        button_text
        description
        footer_content
        heading_text
        place_holder
      }
    }
  }
}`


const addStockSubscriptionMutation = gql`
mutation($sku: String!){
  MpProductAlertCustomerNotifyInStock(input: {productSku: $sku}){
    customer_email
  }
}
`

const addStockSubscriptionGuestMutation = gql`
mutation($email: String!, $sku: String!){
  MpProductAlertNotifyInStock(input: {
    email: $email,
    productSku: $sku
  }){
    customer_email
  }
}`


export const useNotifyGalleryItem = (props) => {
    const url_key = props ? props.url_key : null
    const [getAlert, {data, loading, error}] = useLazyQuery(productAlertQuery, {
        variables: {
            url_key: url_key
        }
    });

    const {data: alertConfig} = useQuery(alertConfigQuery)

    const [addStockSubscriptionSignIn, {}] = useMutation(addStockSubscriptionMutation, {
        variables: {
            sku: data ? data.products.items[0].sku : null
        }
    })

    const [addStockSubscriptionGuest, {}] = useMutation(addStockSubscriptionGuestMutation)

    const [message, setMessage] = useState(null)
    const [messageType, setMessageType] = useState(null)
    const [popupData, setPopUpData] = useState(null)
    const [showPopup, setShowPopup] = useState(false)
    const [{isSignedIn}, {}] = useUserContext();
    const [globalLoading, setGlobalLoading] = useState(false)

    useEffect(() => {
        if (isSignedIn) {
            setMessage(null)
        }
    }, [isSignedIn])

    useEffect(() => {
        if (url_key) {
            getAlert()
        }
    }, [url_key, getAlert])

    // useEffect(() => {
    //     if (alertConfig) {
    //         setPopUpData({
    //             ...alertConfig.MpProductAlertsConfigs.stock_alert.popup_setting,
    //             callback: () => {
    //             }
    //         })
    //     }
    // }, [alertConfig])

    const handleNotifyPress = () => {
        setMessage(null)
        setMessageType(null)
        if (isSignedIn) {
            setGlobalLoading(true)
            return addStockSubscriptionSignIn()
                .then(data => {
                    // console.warn(JSON.stringify(data, null, 2))
                    setMessage(alertConfig.MpProductAlertsConfigs.stock_alert.subscribed_text)
                    setMessageType('Success')
                    setGlobalLoading(false)
                })
                .catch(err => {
                    // console.warn(JSON.stringify(err, null, 2))
                    setMessage('You have already subscribed.')
                    setMessageType('Failure')
                    setGlobalLoading(false)
                })
        } else if (alertConfig) {
            setPopUpData({
                ...alertConfig.MpProductAlertsConfigs.stock_alert.popup_setting,
                callback: async (email) => {
                    setGlobalLoading(true)
                    return addStockSubscriptionGuest({
                        variables: {
                            email: email,
                            sku: data ? data.products.items[0].sku : null
                        }
                    })
                        .then(data => {
                            // console.warn(JSON.stringify(data, null, 2))
                            setMessage(alertConfig.MpProductAlertsConfigs.stock_alert.subscribed_text)
                            setMessageType('Success')
                            setGlobalLoading(false)
                        })
                        .catch(err => {
                            // console.warn(JSON.stringify(err, null, 2))
                            setMessage('You have already subscribed.')
                            setMessageType('Failure')
                            setGlobalLoading(false)
                        })
                }
            })
            setShowPopup(true)
        }
    }

    const isProductOutOfStock = data ? (data.products.items[0].stock_status === 'OUT_OF_STOCK') : false
    const shouldShowNotification = data
        ? (data.products.items[0]['mp_productalerts_stock_notify'] !== '0' && isProductOutOfStock
            && alertConfig && alertConfig['MpProductAlertsConfigs'].stock_alert.show_listing_page
            && !message)
        : false

    return {
        data: data,
        shouldShowNotification: shouldShowNotification,
        message: message,
        messageType: messageType,
        popupData: popupData,
        showPopup: showPopup,
        setShowPopup: setShowPopup,
        button_text: alertConfig ? alertConfig['MpProductAlertsConfigs'].stock_alert.button_text : null,
        globalLoading: globalLoading,
        handlePress: handleNotifyPress,
        shouldMessageHaveMargin: false,
        isProductOutOfStock: isProductOutOfStock,
        print: data ? (data.products.items[0].stock_status):''
    }

}
