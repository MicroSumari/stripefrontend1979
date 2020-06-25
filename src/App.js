import React from 'react';
import './App.css'
const axios = require('axios');

class App extends React.Component {
    state = {
    tokens : [],
    showForm: false,
    index:-1,
    key: '',
    couponName: '',
    couponValue: '',
    couponDuration:'',
    USD_P: '',
    err_msg:'' 
  }

  onChangeCouponName = (e) => {this.setState({couponName:e.target.value})};
  onChangeCouponValue = (e) => {this.setState({couponValue:e.target.value})};
  onChangeCouponDuration = (e) => {this.setState({couponDuration:e.target.value})};
  onChangeCouponUSDorPercent = (e)=> {this.setState({USD_P:e.target.value})};
  
  async componentDidMount(){
    
    const response = await axios.get('https://stripe-backend-1979.herokuapp.com/tokens');
    this.setState({tokens:response.data});
    console.log(response);
  };

  async deleteCoupon (index){
    const id = this.state.tokens[index].id;
    const response = await axios.delete(`https://stripe-backend-1979.herokuapp.com/delete-token/${id}`);
    this.forceUpdate();
  }
  async createNewCoupon (){
    console.log(this.state.couponName,'Name1111')
    const response = await axios.post('https://stripe-backend-1979.herokuapp.com/new-token',{data:{
      couponName: this.state.couponName,
      couponValue: this.state.couponValue,
      couponDuration: this.state.couponDuration,
      USD_Percentage: this.state.USD_P
    }});
  }
  
  async updateExistingCoupon (){
    const response = await axios.post('http://localhost:5000/update-token',{data:{
          key: this.state.key,
          couponName: this.state.couponName,
          couponValue: this.state.couponValue,
          couponDuration: this.state.couponDuration,
          USD_Percentage: this.state.USD_P
        }});
  }
  checkFields = () => {
    if (this.state.USD_P === '')
    {
       this.setState({err_msg:'Fill All the Values'});return false;
    }
    if (this.state.couponName === '')
    {
      this.setState({err_msg:'Fill All the Values'});return false;
    }
    if (this.state.couponDuration === '')
    {
      this.setState({err_msg:'Fill All the Values'});return false;
    }
    if (this.state.couponValue === '')
    {
      this.setState({err_msg:'Fill All the Values'});return false;
    }
    if (this.state.couponDuration.toLocaleLowerCase() !== 'forever')
    {
      if (isNaN(this.state.couponDuration)){
        this.setState({err_msg:'Coupon Duration should be a number or type `Forever`'}); return false;
      }  
    }
    if (!(this.state.USD_P === 'usd' || this.state.USD_P === '%')){
      this.setState({err_msg:'Coupon Value should be in usd or Percentage'}); return false;
    }
    if (this.state.USD_P === '%' && (parseInt(this.state.couponValue)>100 || parseInt(this.state.couponValue)<0.1)) {
      this.setState({err_msg:'Percentage should be less than 100 and greater than 0'}); return false;
    }
    if (this.state.USD_P === 'usd' && parseInt(this.state.couponValue)< 0){
      this.setState({err_msg:'Amount should be greater than 0 dollars.'}); return false;
    }
    return true;
  }
  handleSubmit = (event) =>  {
    event.preventDefault();
    if (this.checkFields())
    {
      console.log('Successfully submitted the form');
      this.setState({showForm:false});
      this.setState({err_msg: ''});
      if (this.state.key === '')
      {
        this.createNewCoupon(); 
      }
      else{
        this.deleteCoupon(this.state.index);
        this.createNewCoupon();  
      }
    }
    
  }

  showForm(){
    if (this.state.showForm){
      return (
        <form onSubmit={this.handleSubmit} className="ui form">
          <div className="field" style={{textAlign:"center",marginTop:"10px"}}>
          <h3>Add a new product</h3>
          <label style={{color:'red'}}>{this.state.err_msg}</label>
          </div>
          <div className="field">
          <label>Name of the Coupon:</label>
          <input name="coupon" value={this.state.couponName} type="text" onChange={this.onChangeCouponName}/>
          </div>
          <div className="field">
          <label>Coupon Value(Enter Amount or Coupon Percent):</label>

          <input name="value" value={this.state.couponValue} type="number" onChange={this.onChangeCouponValue}/>
          <label>In usd or Percentage (%):</label>
          <input name="value"  value={this.state.USD_P} type="text" onChange={this.onChangeCouponUSDorPercent}/>

          </div>
          <div className="field">
          <label>Duration(Enter Forever or number of months:)</label>
          <input name="duration" type="text" value={this.state.couponDuration} onChange={this.onChangeCouponDuration}/>
          <button style={{float:'right',marginTop:'10px'}}className="ui button">Submit</button>
          </div>
        </form>

      )
    }
    return <div></div>
  }
  timeDuration(forever,percent,amount,duration){
    let period = '';

    if (!duration){
      period = forever;
    }
    else{
      period = duration + ' month';
    }
    if (!amount){
      return percent + '% off for ' + period
    }
    return amount + " off for " + period
  }
  updateCoupon = (event,index) => {
    const coupon = this.state.tokens[index];
    this.setState({index:index})
    this.setState({showForm:true});
    this.setState({couponName: coupon.name});
    this.setState({key:coupon.id});
    let val = 0;
    if (!coupon.percent_off){
      val = coupon.amount_off;
      this.setState({USD_P:'usd'});
    }
    else{
      val = coupon.percent_off;
      this.setState({USD_P:'%'})
    }
    this.setState({couponValue: val});
    if (!coupon.duration_in_months){
      this.setState({couponDuration:'forever'});
    }
    else{
      this.setState({couponDuration: ''+coupon.duration_in_months});
    }
    
  }
  renderList(){
    try{
      return this.state.tokens.map((token,index) => {
        console.log(token)
        return (
          <div key={token.id} name={token.id} className="shadow">
            <span>
              <label className="right">
                {token.name}
              </label>
            </span>
            <span>
              <label className="center">
                {this.timeDuration(token.duration,token.percent_off,token.amount_off,token.duration_in_months)}
              </label>
            </span>
            <span style={{float:"right",paddingRight:'10px'}}>
            <button style={{marginRight:'20px'}} name={index} className="circular teal ui icon button" onClick={(e)=>{this.updateCoupon(e,index)}}>
              <i className="pencil icon"></i>
            </button>
            <button name={token.id} className="circular red ui icon button" onClick={e =>this.deleteCoupon(index)}>
             <i className="trash alternate outline icon"></i>
            </button>
            </span>
          </div>
        )
      })
    }

    catch(e){
        console.log(e)
    }
  }
  render(){

    return (
      <div className="parent">
      <h1 style={{textAlign:'center',marginTop:'20px'}}>Stripe Coupons</h1>

      {this.renderList()}
      <div style={{textAlign:'center'}}>
        <button style={{marginTop:'10px'}}className="blue ui button" onClick={(e)=>{this.setState({showForm: true})}}>

          Add a new Coupon
        </button>
      </div>
      {this.showForm()}

    </div>
    )
  }
}

export default App;