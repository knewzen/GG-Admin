const Products = require('../model/products')
const fs = require('fs')
const {getList, getParam} = require('../utils/utils')
const async = require('async')

const getProductsList = function(req, res, next){
    let pageSize = 6
    let { pageNo } = req.query
    async.parallel([
        function(cb){
            Products.find({})
            .then((all)=>{
                let pageCount = Math.ceil(all.length / pageSize)
                cb(null,pageCount)
            })
        },
        function(cb){
            Products.find({})
            .skip( (pageNo-1) * pageSize )
            .limit( pageSize )
            .sort({_id: -1})
            .then((result) => {
                cb(null,result)
                
            })
        }
    ], function(err,results){
        // console.log(results)
        let page = {
            "pageSize":pageSize,
            "result":results[1],
            "pageCount":results[0],
            "pageNo": pageNo
        }
        res.json(getList({"page":page}))
    })
}

const saveProductsList = function(req, res, next){
    const { goodsName,_id,goodsBrand, goodsListImg, price, discount, imgsUrl, className, info} = req.body

    if( req.body._id != ''){
        console.log('修改')
        const setObj = {
            goodsName,
            goodsBrand,
            price,
            discount,
            imgsUrl:"['https://img.alicdn.com/imgextra/i1/263817957/TB2zHIOdFXXXXa_XpXXXXXXXXXX-263817957.jpg','https://img.alicdn.com/imgextra/i2/263817957/TB2BDgYdFXXXXc0XXXXXXXXXXXX-263817957.jpg','https://img.alicdn.com/imgextra/i1/263817957/TB22x77dFXXXXaPXXXXXXXXXXXX-263817957.jpg']",
            className,
            info,
            createTime: new Date().getTime(),
        }

        if(goodsListImg){
            var base64Data = goodsListImg.replace(/^data:image\/\w+;base64,/, "");
            var pattern =/\/(.+?);/g;
            var extension=goodsListImg.match(pattern);
            for(var i=0,len=extension.length;i<len;i++){
                extension[i] = extension[i].replace("/","").replace(";","");
            }
            extension = '.'+extension[0]
            //解析路径
            var dataBuffer = new Buffer(base64Data, 'base64');
            let basepath = './public/images/upload/'
            let timer = Date.now()
            fs.writeFile(basepath+timer+extension, dataBuffer, function(err) {
                if(err) throw err;
                setObj.goodsListImg = 'http://localhost:3000/images/upload/'+timer+extension
            });
        }

        Products.findByIdAndUpdate(req.body._id,{
            $set: setObj
        }).then(()=>{
            res.json(getParam({success:true}))
        })
    } else {
        console.log('添加')
        //对base64解析
        var base64Data = goodsListImg.replace(/^data:image\/\w+;base64,/, "");
        var pattern =/\/(.+?);/g;
        var extension=goodsListImg.match(pattern);
        for(var i=0,len=extension.length;i<len;i++){
            extension[i] = extension[i].replace("/","").replace(";","");
        }
        extension = '.'+extension[0]
        //解析路径
        var dataBuffer = new Buffer(base64Data, 'base64');
        let basepath = './public/images/upload/'
        let timer = Date.now()
        fs.writeFile(basepath+timer+extension, dataBuffer, function(err) {
            if(err) throw err;
            const willSaveProducts = new Products({
                goodsName,
                goodsBrand,
                price,
                discount,
                imgsUrl:"['https://img.alicdn.com/imgextra/i1/263817957/TB2zHIOdFXXXXa_XpXXXXXXXXXX-263817957.jpg','https://img.alicdn.com/imgextra/i2/263817957/TB2BDgYdFXXXXc0XXXXXXXXXXXX-263817957.jpg','https://img.alicdn.com/imgextra/i1/263817957/TB22x77dFXXXXaPXXXXXXXXXXXX-263817957.jpg']",
                className,
                info,
                createTime: new Date().getTime(),
                goodsListImg:'http://localhost:3000/images/upload/'+timer+extension
            })
            willSaveProducts.save().then(()=>{
                console.log('添加成功')
                res.json(getParam({success: true}))
            })  
        });
        
    }
    
}

//删除

const deleteProducts = function(req,res,next){
    const { ids } = req.query
    let idsArr = ids.split(',')
    let idQuery = idsArr.map((item=>{
        return {_id:item}
    }))
    console.log(idQuery,'我要准备删除了')
    Products.deleteMany({$or:idQuery})
    .then((resultss)=>{
        res.json(getParam({success:true}))
    })
}

const getOneProducts = function(req, res, next){
    const { id } = req.query
    Products.findOne({ _id : id })
    .then((result)=>{
        res.json(getParam({result}))
    })
}

module.exports = {
    getProductsList,
    saveProductsList,
    deleteProducts,
    getOneProducts
}