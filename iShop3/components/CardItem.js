"use strict";
import React from 'react';
import PropTypes from 'prop-types';

import './CardItem.css';

class CardItem extends React.Component {
    static propTypes = {
        item: PropTypes.shape({                      // ----- массив с данными о каждом item
            code: PropTypes.number.isRequired,
            itemName: PropTypes.string.isRequired,   // ----- назвазвание item
            price: PropTypes.number.isRequired,
            count: PropTypes.number.isRequired,
            url: PropTypes.string.isRequired,
        }),
        newCode: PropTypes.number,
        workMode:PropTypes.number.isRequired,  // ------ 1-edit, 2-add, 3-see, 0-button
        cbEditItemList:PropTypes.func.isRequired,
        cbAddItemToList:PropTypes.func.isRequired,
        cbCancel: PropTypes.func.isRequired,
        cbIsRedactTime: PropTypes.func.isRequired, //----- true - заблокированы кнопк edit и X  false - расблокированы
        cbLastCodeChange: PropTypes.func.isRequired,
    };

    state = {
        item: {
            code: this.props.item?this.props.item.code:this.props.lastCode,                //---- если передан в item: null
            itemName: this.props.item?this.props.item.itemName:null,            //---- значит значения пусты
            price: this.props.item?this.props.item.price:null,               //---- иначе взять значения из Item
            count: this.props.item?this.props.item.count:null,
            url: this.props.item?this.props.item.url:null,
        },
        itemNameValid: this.props.item?!!this.props.item.itemName:false,
        countValid: this.props.item?!!this.props.item.count:false,
        priceValid: this.props.item?!!this.props.item.price:false,
        urlValid: this.props.item?!!this.props.item.url:false,
        formValid: false,
        isDisabled: true,  // ----------- кнопка не доступна

     };

    validateFields = (name, value) =>{

        let itemNameValid = this.state.itemNameValid;
        let countValid = this.state.countValid;
        let priceValid = this.state.priceValid;
        let urlValid = this.state.urlValid;

        switch(name) {
            case "itemName":
                itemNameValid = (value.length>3)&&true;
                break;
            case "count":
                countValid = (value)&&true;
                break;
            case "price":
                priceValid = (value)&&true;
                break;
            case "url":
                urlValid = (value)&&true;
                break;
        }
        this.setState({
            itemNameValid: itemNameValid,
            countValid: countValid,
            priceValid:priceValid,
            urlValid:urlValid
        }, this.validateForm);
    };

validateForm() {
    this.setState({formValid: this.state.itemNameValid &&
            this.state.countValid&&
            this.state.priceValid&&
            this.state.urlValid
    });
}
    handleChangeString = (EO) => {
        const NAME = EO.target.name;
        const VALUE = EO.target.value;
        this.setState({
            item : {
                ...this.state.item,                   // ------ в стейте есть item, присвоить ему значения из this.state.item
                [NAME]:VALUE}},     // ----- и добавить еще это значене
                        () => { this.validateFields(NAME, VALUE)})
        this.props.cbIsRedactTime(true);                //------ передаем родителю запрет на кнопки
    };

    handleChangeNumber = (EO) => {
        const NAME = EO.target.name;
        const VALUE = EO.target.value;
        this.setState({
                item : {
                    ...this.state.item,                   // ------ в стейте есть item, присвоить ему значения из this.state.item
                    [NAME]:parseFloat(VALUE)}},     // ----- и добавить еще это значене
            () => { this.validateFields(NAME, VALUE)})
        this.props.cbIsRedactTime(true);                        //------ передаем родителю запрет на кнопки
    };

    handleClickSave = (EO) =>{
        EO.stopPropagation();
        this.setState({
            formValid: false,
        });
        if(this.props.workMode === 1){
            this.props.cbEditItemList(this.state.item);
        }
        else{
            this.props.cbAddItemToList(this.state.item);
            this.props.cbLastCodeChange(this.props.lastCode + 1);
        }
        this.props.cbIsRedactTime(false);
    };

    handleClickCancel = (EO) =>{
        EO.stopPropagation();
        this.props.cbCancel(this.state.item);
        this.setState({ formValid: false });
        this.props.cbIsRedactTime(false);
    };
    // handleSubmit = (EO) =>{
    //     console.log('ENTER SUBMIT');
    //     EO.preventDefault();
    // };

    createInput = (_name, _value, _type, _nameValid) => {
        return (
        <div className = "strList">
             <label className = "labelList"> {_name}
            <input  className = "inputList"
                    type = {_type}
                    name = {_name}
                    defaultValue = {_value}
                    onChange = {(_type==='number')?this.handleChangeNumber:this.handleChangeString}/>
            </label>
            <span className = "error">{(_nameValid)?" ": "Заполните поле!"} </span>
        </div>
        )
    };
 
    render(){
        let arr=[];
/*------------ СОЗДАЕМ карточку ----EDIT--- ( ВИДНА ПРИ "WORKMODE" == 1) ---------*/
        let itemData = this.props.item;
            if(this.props.workMode === 1) {
                arr.push(
                    <h2 key = 'title' className = 'EditListTitle'>Edit Product</h2>
                );
                arr.push(
                    <form key = 'formEdit' name = 'formList' onSubmit={this.handleSubmit}>
                        <div className = 'strList'>
                            <img src={itemData.url} className='item__img'alt='Image'/>
                        </div>

                        <div className='strList'>
                            <label className = 'labelLiWst'>Code: {itemData.code}</label>
                        </div>

                        {this.createInput("itemName", itemData.itemName, "text", this.state.itemNameValid)}
                        {this.createInput("price", itemData.price, "number", this.state.priceValid)}
                        {this.createInput("count", itemData.count, "number", this.state.countValid)}

                        <input type="button" value="Save" onClick = {this.handleClickSave} disabled={!this.state.formValid}/>
                        <input type="button" value="Cancel" onClick = {this.handleClickCancel}/>
                    </form>
                )
            }
 /*------------ СОЗДАЕМ карточку для ----- ADD ----- ( ВИДНА ПРИ "WORKMODE" == 2) ---------*/
            if(this.props.workMode === 2) {

                arr.push(
                    <h2 key = 'title' className = 'EditListTitle'>Add Product</h2>
                );
                arr.push(
                    <form key = 'formAdd' name = 'formList' onSubmit={this.handleSubmit}>

                        <div className='strList'>
                            <label className = 'labelLiWst'>Code: <span  className = "inputList">{this.props.lastCode}</span></label>
                        </div>

                        {this.createInput("url", "", "text",this.state.urlValid)}
                        {this.createInput("itemName", "", "text",this.state.itemNameValid)}
                        {this.createInput("price", "", "number", this.state.priceValid)}
                        {this.createInput("count", "", "number", this.state.countValid)}

                        <input type="button" value="Save" onClick = {this.handleClickSave} disabled={!this.state.formValid}/>
                        <input type="button" value="Cancel" onClick = {this.handleClickCancel}/>
                    </form>
                )
            }
 /*------------ СОЗДАЕМ карточку для просмотра продукта ( ВИДНА ПРИ "WORKMODE" == 3) ---------*/
            if(this.props.workMode === 3) {
                arr.push(
                    <h2 key = 'title' 
                        className = 'EditListTitle'>{this.props.item.itemName}</h2>
                );
                arr.push(
                    <div  key = {itemData.code} 
                        className = 'ItemList'> 
                        <img className = 'item__img' src = {itemData.url} alt='Not foto'/>
                        <div className = 'listPrice'>Price: {itemData.price}$</div>
                        <div className = 'listCount'>Count: {itemData.count}</div>
                    </div>
                )
            }
    return (
        <React.Fragment>
            {arr}
        </React.Fragment>
    )}
}
export default CardItem;