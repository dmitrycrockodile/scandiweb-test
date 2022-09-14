import { Component } from 'react';
import { connect } from 'react-redux';
import { useParams, Link } from "react-router-dom";
import { Interweave } from 'interweave';

import { loadProduct } from '../../../features/productsSlice';
import { addToCart } from '../../../features/cartSlice';

import RadioGroup from '../../radioGroup/RadioGroup';
import Carousel from '../../carousel/Carousel';

import classes from './productPage.module.css';

function withParams(Component) {
  return props => <Component {...props} params={useParams()} />;
}

class ProductPage extends Component {
   componentDidMount() {
      const id = this.props.params.productId;
      this.props.loadProduct(id);
   }

   componentDidUpdate() {
      if (this.props.products.item.id !== this.props.params.productId) {
         const id = this.props.params.productId;
         this.props.loadProduct(id);
      }
   }
   
   render() {
      const { products, params, addToCart, currencies } = this.props;

      const item = products.item;
      const porduct = (products.item.id !== params.productId) ? null : <Product addToCart={addToCart} product={item} currencies={currencies.currentCurrency}/>
      
      return (
         <div className='productPage'>
            {porduct}
         </div>
      );
   }
};

class Product extends Component {
   state = {
      attributeValues: [],
   }

   handleAttributeChange = (attr) => {
      this.setState(({attributeValues}) => {
         const index = attributeValues.findIndex(el => el.id === attr.id);
         
         if (index >= 0) {
            return attributeValues[index].current = attr.current;
         } else if (index === -1) {
            return {
               attributeValues: [...attributeValues, attr]
            }
         }
      });
   }

   handleAddToCart = () => {
      const attributeValues = this.state.attributeValues;
      const data = {...this.props.product, attributeValues}
      return data;
   }
   
   render() {
      const { currencies, product, addToCart } = this.props;
      const { brand, name, gallery, attributes, id, prices, description, inStock } = product;
      const price = prices.filter(price => price.currency.symbol === currencies).map(item => item.amount);
      
      return (
         <div className={classes.product} key={id}>
            <div className={classes.slider}>
               <Carousel arr={gallery} dots alt={name}/>
            </div>
            <div className={classes.content}>
               <div className="heading">
                  <h2 className={classes.title}><span>{brand}</span><br/> {name}</h2>
               </div>
               <div>    
                  {attributes.map(attr => {
                     return ( 
                        <RadioGroup 
                           key={attr.name}
                           attributes={attr}
                           onChange={this.handleAttributeChange}/>
                     ) 
                  })}
                  <div className={classes.typeTitle}>Price:</div>
                  <span className={classes.price}>{currencies}{price}</span>
               </div>
               <Link to="/cart">
                  <button className={inStock ? `${classes.orderBtn}` : `${classes.orderBtn} ${classes.notInStock}`}
                          disabled={!inStock} 
                          onClick={() => addToCart(this.handleAddToCart())}
                          >{inStock ? 'Order' : 'Not in stock'}</button>
               </Link>
               <div className={classes.description} >
                  <Interweave content={description} />
               </div>
            </div>
         </div>
      );
   }
}
const mapStateToProps = (state) => ({
   products: state.products,
   currencies: state.currencies
})
export default connect(mapStateToProps, {
   loadProduct,
   addToCart
})(withParams(ProductPage));