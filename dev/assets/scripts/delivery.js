import { Master, masterNotice, masterModal  } from './master.js';
import { createFormItem } from './helpers/formgroup.js';
import { Accordion } from './uxui/accordion.js';

import { DELIVERY_TEMPLATE_API } from './helpers/const.js';

const Delivery = function () {
  let dl = new Master();
  dl.storageName = 'phieugiaohang';

  let init = dl.init;
  dl.title = 'Phiếu giao hàng';
  // tạo lại phần khởi tạo đặt thù của quotation

  dl.updateDelivery = async ({ event }) => {
    // lấy thông tin từ server với ID là order
    
    let ownData = event.target.ownData;
    try {
      let order = await dl.getOrder({ orderId: ownData.ID });
      order.products.map(product => product.orderId = ownData.ID);
      if (!dl.data.user) {
        dl.data = { ...dl.data, user: order.user, products: order.products }
        masterNotice.open({
          message: `Đã thêm đơn hàng #${ownData.ID} vào phiếu giao hàng`,
          icon: true,
          style: 'info',
          timer: 1500
        });
      } 
      else {

        if (dl.data.user.nickname == order.user.nickname) {
          // kiểm tra có phải là ID order cũ không?
          let existOrder = dl.data.products.find(product => product.orderId == ownData.ID);
          if (!existOrder) {
            dl.data.products = [...dl.data.products, ...order.products];
            masterNotice.open({
              message: `Đã thêm đơn hàng #${ownData.ID} vào phiếu giao hàng`,
              icon: true,
              style: 'info',
              timer: 1500
            });

          } else {
            masterModal.open({ config: 
              {
                title: 'Cảnh báo',
                footer: false,
                content:  dl.existOrderInDelivery({ order, ID: ownData.ID }),   

              }
            });
          }

          // existOrder? thông báo đã có đơn hàng này trong báo giá, bạn có muốn cập nhật lại không :
          //              cập nhật thêm order vào
        } else {          
          
          masterModal.open({ config: {
              title: 'Cảnh báo',
              clear: true,
              content: dl.notSameCustomer({ order, ID: ownData.ID }),
            }
          });
        }
      }
      // kiểm tra user trong delivery bằng cách kiểm tra nickname
      // nếu cùng nick name -> thêm product vào 
    } catch {

    } finally {

      localStorage.setItem(dl.storageName, JSON.stringify(dl.data));
    }
  }

  dl.notSameCustomer = ({ order, ID }) =>
    createFormItem({
      tag: 'p',
      className: 'Message',
      innerHTML: 'Khách hàng thuộc đơn hàng bạn muốn thêm vào không trùng với khách hàng hiện tại. Bạn muốn &nbsp;',
      children: [
        {
          tag: 'a',
          href: '#',
          innerHTML: 'thay đổi',
          onclick: event => dl.changeAllDelivery({ event, order, ID }),
        }
      ],
    })

  dl.existOrderInDelivery = ({ order, ID }) =>
    createFormItem({
      tag: 'p',
      className: 'Message',
      innerHTML: 'Đã tồn đơn hàng này trong phiếu giao hàng. Bạn muốn &nbsp;',
      children: [
        {
          tag: 'a',
          href: '#',
          innerHTML: 'Cập nhật lại',
          onclick: event => dl.updateAgainOrder({ event, order, ID }),
        }
      ],
    })

  dl.changeAllDelivery = ({ event, order, ID }) => {
    // thay đổi toàn bộ dữ liệu  của phiếu giao hàng khi có sự khác nhau của khách hàng
    dl.data.user = order.user;
    dl.data.products = order.products;
    localStorage.setItem(dl.storageName, JSON.stringify(dl.data));
    masterModal.close();
    masterNotice.open({
      message: `Đã cập nhật lại phiếu giao hàng với khách hàng & đơn hàng mới`,
      icon: true,
      style: 'info',
      timer: 1500
    });
  }

  dl.updateAgainOrder = ({ event, order, ID }) => {
    // cập nhật lại đơn hàng khi ID 2 đơn hàng trùng nhau
    let exist = dl.data.products.filter(product => product.orderId != ID);
    dl.data.products = [...exist, ...order.products];
    localStorage.setItem(dl.storageName, JSON.stringify(dl.data));
    masterModal.close();
    masterNotice.open({
      message: `Đã cập nhật lại đơn hàng #${ID} vào phiếu giao hàng`,
      icon: true,
      style: 'info',
      timer: 1500
    });
  }  

  dl.createAttribute = () => [];
  dl.updateTotal = () => {};

  dl.otherPage = () => {
    let updateLinks = document.querySelectorAll('.updateDelivery');
    updateLinks.forEach(link => {
      let ownData = JSON.parse(link.getAttribute('data'));
      Object.assign(link, {
        ownData,
        onclick: event => dl.updateDelivery({ event }),
      })

    });
  }

  return dl;
}

const delivery = new Delivery().init({
  id: 'delivery',
  templateName: 'delivery',
  restAPI: DELIVERY_TEMPLATE_API,
}); 
window.onload = function() {
  const accordion = new Accordion().init({ id: 'accordion', onlyAccordionOpen: true });
}
