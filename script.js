// let token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjMzNTg4OTE2MCwiYWFpIjoxMSwidWlkIjo1NzQ0NDIwOSwiaWFkIjoiMjAyNC0wMy0yMVQwMjo0MDoyNS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTIyNjMxODUsInJnbiI6InVzZTEifQ.TWvpOEhzwOTH5TeoaFeIbkUJAMSIWBytryEIH4cUrEw'

// let query = 'query { boards(ids: 6292532342 limit: 10) { columns{id title} items_page{ items{ name column_values{ id text value }}}}}';
window.jsPDF = window.jspdf.jsPDF

let title1 = ""
let title2 = ""
// console.log('title1==',title1)
// console.log('title2==',title2)

// if(title1 != null){
//     title_text.innerHTML = title1
//     print_title_input.value = title1
// }
// if(title2 != null){
//     subTitle.innerHTML = title2
//     print_title_input2.value = title2
// }


const getResult = function(a1, a2) {
    let i = a1.length;
    // console.log("i=", i)
    // console.log("a2.length=", a2.length)
    if (i != a2.length) return false;

    while (i--) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
};

const monday = window.mondaySdk();
// let boardId = '';
// let userId = '';

// 你的API Key
const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjMzNTg4OTE2MCwiYWFpIjoxMSwidWlkIjo1NzQ0NDIwOSwiaWFkIjoiMjAyNC0wMy0yMVQwMjo0MDoyNS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTIyNjMxODUsInJnbiI6InVzZTEifQ.TWvpOEhzwOTH5TeoaFeIbkUJAMSIWBytryEIH4cUrEw';

// 你想要抓取的board ID
let boardId
let first = true
// 設定API請求的URL
const url = 'https://api.monday.com/v2';

// 設定API請求的headers
const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json'
};
let oldBoardId = localStorage.getItem("boardid")
// console.log('oldBoardId=',oldBoardId)
// console.log(oldBoardId == null)

let filterID = []
let itemList = []
let allData
let columnNum = 2
let oldColumn = 'none'
let itemCount = 0
let cursor = ''
let limit = 500
async function fetchItems() {
    const query = `
 query {
    boards(ids:["${boardId}"]) {
    columns{
      id
      title
    }
    items_count
    items_page(limit: 500) {
        cursor
        items {
          id
          name
          column_values {
            id
            text
            value
          }
        }
    }
    groups{
      id
      title
      
    }
    }
    
 }
 `;

    // 使用monday SDK來執行GraphQL查詢
    const response = await monday.api(query);

    // 檢查查詢是否成功
    if (!response.data) {
        throw new Error('查詢失敗');
    }

    // 返回查詢結果中的項目
    console.log("alldata=", response.data)
    allData = response.data
    itemCount = allData.boards[0].items_count
    cursor = allData.boards[0].items_page.cursor

    createCheckbox()

    return response.data.boards[0].items_page.items;
}

async function getNextItem() {
    console.log('cursor==', cursor)
    const query = `
 query {
    next_items_page (limit: 500, cursor: "${cursor}") {
    cursor
    items {
      id
      name
      column_values{
            id
            text
            value
          }
      }
    }   
  }
 `;

    // 使用monday SDK來執行GraphQL查詢
    const response = await monday.api(query);

    // 檢查查詢是否成功
    if (!response.data) {
        throw new Error('查詢失敗');
    }

    // 返回查詢結果中的項目
    console.log("alldata_next=", response.data)
    // allData = response.data
    // itemCount = allData.boards[0].items_count
    // cursor = allData.boards[0].items_page.cursor
    cursor = response.data.next_items_page.cursor
    const tmp = response.data.next_items_page.items
    for (let i = 0; i < tmp.length; i++) {
        itemList.push(tmp[i])
    }
    console.log('itemList_next=', itemList)
    if (itemCount > limit) {
        getNextItem()
        limit += 500
    } else {
        first = false
        // createImage()
    }
}
async function filterItems() {
    // 抓取項目
    itemList = await fetchItems();
    console.log("itemList===", itemList)
    if (itemCount > limit) {
        getNextItem()
        limit += 500
    } else {
        first = false
        // createImage()
    }


    // 過濾項目

}

let allCheckbox = []

function createCheckbox() {
    const tmp = allData.boards[0].columns
    // console.log('tmp==', tmp)
    // console.log('len==', tmp.length)
    const len = tmp.length
    let allDiv = document.createElement('div')
    allDiv.className = "item_column"
    // let n = 0
    let allInput = document.createElement("INPUT");
    allInput.setAttribute("type", "checkbox");
    allInput.id = "checkbox_all"
    allInput.className = 'checkbox_css'
    let allLabel = document.createElement("Label");
    allLabel.setAttribute("for", "checkbox_all");
    allLabel.innerHTML = "全部欄位";
    allDiv.appendChild(allInput)
    allDiv.appendChild(allLabel)
    all_item.appendChild(allDiv)


    let n = 0
    for (let i = 0; i < len; i++) {
        const id = tmp[i].id
        if (id != "subitems") {

            let div = document.createElement('div')
            div.className = "item_column"
            let x = document.createElement("INPUT");
            x.setAttribute("type", "checkbox");
            x.id = tmp[i].id
            x.title = tmp[i].title
            x.className = 'checkbox_css'
            allCheckbox.push(x)
            let newlabel = document.createElement("Label");
            newlabel.setAttribute("for", "checkbox_" + n);
            if (tmp[i].title == 'Name' || tmp[i].title == 'name') {
                newlabel.innerHTML = '項目';
            } else {
                newlabel.innerHTML = tmp[i].title;
            }

            div.appendChild(x)
            div.appendChild(newlabel)
            all_item.appendChild(div)
            x.addEventListener('change', function() {
                if (this.checked) {
                    console.log("this=", this)
                    // console.log('allitem is checked.');
                    // 在這裡添加你需要執行的代碼

                    // allCheckbox[j].checked = true
                    clearData()
                    setData()

                } else {


                    // allCheckbox[j].checked = false
                    clearData()
                    setData()
                    // 在這裡添加你需要執行的代碼
                }
            });

            n++
        }
    }

    allInput.addEventListener('change', function() {
        if (this.checked) {
            console.log("this=", this)
            // console.log('allitem is checked.');
            // 在這裡添加你需要執行的代碼
            for (let j = 0; j < allCheckbox.length; j++) {
                allCheckbox[j].checked = true
                clearData()
                setData()
            }
        } else {
            console.log('allitem is unchecked.');
            for (let j = 0; j < allCheckbox.length; j++) {
                allCheckbox[j].checked = false
                clearData()
                checkData()
            }
            // 在這裡添加你需要執行的代碼
        }
    });




}

function setData() {
    const checkbox = document.querySelectorAll('.image_box_right')
    checkbox.forEach((item, index) => {
        const column_values = item.column_values

        for (let i = 0; i < allCheckbox.length; i++) {

            let checkbox = allCheckbox[i]
            if (checkbox.checked == true) {
                const id = checkbox.id
                const title = checkbox.title
                let tmp3 = allData.boards[0].columns
                
                let isImg = false
                // for (let k = 0; k < tmp3.length; k++) {
                //     const ti = tmp3[k].title
                    if (title[title.length - 2] == "照" && title[title.length - 1] == '片') {
                        isImg = true
                        // break;
                    }
                // }
                console.log("isImg=",isImg)
                let txt = ''
                let txt2 = ''
                for (let k = 0; k < id.length; k++) {
                    if (k < 5) {
                        txt = txt + id[k]
                    }
                    if (k < 4) {
                        txt2 = txt2 + id[k]
                    }

                }
                // console.log("txt=", txt)
                // console.log("txt2=", txt2)
                if (txt != "files" && txt2 != 'file' && isImg == false) {
                    // if (checkbox.id != 'files') {
                    let div = document.createElement('div')
                    div.className = 'right_text_box'
                    let t1 = document.createElement('p')
                    if (checkbox.title == "Name" || checkbox.title == "name") {
                        t1.innerHTML = "項目"
                    } else {
                        t1.innerHTML = checkbox.title
                    }

                    t1.className = 'right_text_content'
                    let t2 = document.createElement('p')
                    t2.className = 'right_text_content'
                    if (checkbox.id == 'name') {
                        t2.innerHTML = item.name
                    } else {
                        t2.innerHTML = getValue(checkbox.id, column_values)
                    }

                    div.appendChild(t1)
                    div.appendChild(t2)
                    item.appendChild(div)
                }
            }
        }
    })
    checkData()
}

function getValue(id, values) {
    let txt = ''
    for (let i = 0; i < values.length; i++) {
        if (id == values[i].id) {
            txt = values[i].text
            break
        }
    }

    return txt
}

function clearData() {
    const checkbox = document.querySelectorAll('.image_box_right')
    checkbox.forEach((item, index) => {
        item.innerHTML = ''
    })
}

function checkData() {
    const checkbox = document.querySelectorAll('.image_box_right')
    let empty = true
    checkbox.forEach((item, index) => {
        if (item.innerHTML != '') {
            empty = false

        }
    })
    const imgbox = document.querySelectorAll('.image_box')
    imgbox.forEach((item, index) => {
        if (empty == true) {
            item.style.left = '50%'
            item.style.transform = 'translateX(-50%)'
        } else {

            item.style.left = '5px'
            item.style.transform = 'translateX(0)'

        }
    })
}
// print_title_input.addEventListener('input', () => {
//     // console.log(print_title_input.value); // 在輸入框中輸入文字時，即時輸出該文字
//     title_text.innerHTML = print_title_input.value
//     const title = document.querySelectorAll('.title_text')
//     title.forEach((item, index) => {
//         item.innerHTML = print_title_input.value
//     })
//     localStorage.setItem("title1_" + boardId, print_title_input.value)
// });

// print_title_input2.addEventListener('input', () => {
//     // console.log(print_title_input.value); // 在輸入框中輸入文字時，即時輸出該文字
//     subTitle.innerHTML = print_title_input2.value
//     const title = document.querySelectorAll('.subTitle')
//     title.forEach((item, index) => {
//         item.innerHTML = print_title_input2.value
//     })
//     localStorage.setItem("title2_" + boardId, print_title_input2.value)
// });
// monday.listen(['filter'], (res) => {
//     console.log("filter listen", res.data);
// });

// const callback = res => console.log("filter_res=",res);
monday.listen('filter', (res) => {
    loader.style.visibility = 'visible'
    console.log("filter_res=", res)

});


monday.listen("events", async (event) => {
    console.log("event.type==",event.type)
  // if (event.type === "item_update") {
  //   // 處理 item 更新事件
  //   const updatedItem = event.item;
  //   console.log(`Item ${updatedItem.id} has been updated`);
  //   // 根據需要進行額外的操作，如更新其他相關的 item
  // }
});

//@ts-ignore
// monday.get("filter").then(res => console.log("filter get", res));



monday.listen("itemIds", (res) => {
    console.log("data=", res.data);
    // const equal = getResult(res.data, filterID)
    // console.log('equal==', equal)
    // if (equal == false) {

    filterID = res.data
    console.log('first==', first)
    if (first == false) {
        // createImage()
    }
    console.log("newFilterId=", filterID)

    // }

    // [12345, 12346, 12347]
});

monday.get("filter")
    .then(res => console.log("get_filter=", res))

// monday.listen("settings", res => {
//     console.log("settings=", res.data);
//     // {"fieldName": "fieldValue", "fieldName2": "fieldValue2"...}
// });
let allImg = []
let imgData = []

function createImage() {
    content.innerHTML = ''
    allImg = []
    imgData = []
    const len = filterID.length

    for (let i = 0; i < len; i++) {
        const one = getOne(filterID[i])
        // console.log("one==", one)
        if (one.length > 0) {
            for (let j = 0; j < one.length; j++) {
                allImg.push(one[j])
            }
        }
    }
    console.log('data=', imgData)
    setImage()
}

function setImage() {
    console.log('allImg.length=', allImg.length)
    if (allImg.length == 0) {
        loader.style.visibility = 'hidden'
    }
    let n = 0
    for (let k = 0; k < allImg.length; k++) {
        let div = document.createElement('div')
        let div2 = document.createElement('div')
        let div3 = document.createElement('div')
        let img = document.createElement('img')
        // img.crossOrigin = "anonymous";
        div.id = "img_div_" + k
        div3.id = "img_div3_" + k
        div3.name = imgData[k].name
        div3.column_values = imgData[k].column_values
        // for(let i = 0;i < column_values.length ; i++){

        // }
        img.id = "img_" + k
        div2.id = "img_div2_" + k

        if (columnNum == 1) {
            div.className = 'item_img1'
        }
        if (columnNum == 2) {
            div.className = 'item_img2'
        }
        if (columnNum == 3) {
            div.className = 'item_img3'
        }
        if (columnNum == 4) {
            div.className = 'item_img4'
        }
        div2.className = 'image_box'
        div3.className = 'image_box_right'

        img.src = allImg[k]
        // img.src = "a1.jpeg"
        img.className = "image"
        // console.log('Num==',columnNum)
        if (k >= columnNum * 2) {
            if (k % (columnNum * 2) == 0) {
                let div4 = document.createElement('div')
                div4.className = 'title'
                let h2 = document.createElement('h2')
                let h3 = document.createElement('h3')
                h2.className = 'title_text'
                h3.className = 'subTitle'
                h2.innerHTML = title_text.innerHTML
                h3.innerHTML = subTitle.innerHTML
                div4.appendChild(h2)
                div4.appendChild(h3)
                content.appendChild(div4)
            }

        }
        div.appendChild(div2)
        div.appendChild(div3)
        div2.appendChild(img)
        content.appendChild(div)
        img.onload = function() {
            const w = img.offsetWidth
            const h = img.offsetHeight
            const w1 = div2.offsetWidth
            const h1 = div2.offsetHeight
            const rate = h / w
            const rate1 = h1 / w1
            if (rate > rate1) {
                img.style.height = "96%"
                img.style.width = h1 * 0.96 / rate + "px"
            } else {
                img.style.width = "96%"
                img.style.height = w1 * 0.96 * rate + "px"
                // const dh = h1 - 
            }
            // console.log("w=",w)
            // console.log("w1=",w1)
            // console.log("h=",h)
            // console.log("h1=",h1)
            n++
            if (n == allImg.length) {
                clearData()
                setData()
                loader.style.visibility = 'hidden'
            }
        }
    }
}

function getOne(index) {
    const len = itemList.length
    one = []
    let tmp = ''
    let tmp2 = ''
    let tmp3 = allData.boards[0].columns
    let spID = ''
    // console.log('tmp3=',tmp3)
    for (let k = 0; k < tmp3.length; k++) {
        const ti = tmp3[k].title
        if (ti[ti.length - 2] == "照" && ti[ti.length - 1] == '片') {
            spID = tmp3[k].id
            break;
        }
    }
    // console.log('spID=',spID)
    for (let i = 0; i < len; i++) {
        // console.log('index=', Number(index))
        // console.log('id==', Number(itemList[i].id))
        if (Number(index) == Number(itemList[i].id)) {
            tmp = itemList[i].column_values
            tmp2 = itemList[i]

            break;
        }
    }
    // console.log('tmp=',tmp)
    // console.log('tmp2=',tmp2)
    // console.log("column_values=", tmp)
    for (let j = 0; j < tmp.length; j++) {
        const id = tmp[j].id


        let txt = ''
        let txt2 = ''
        for (let k = 0; k < id.length; k++) {
            if (k < 5) {
                txt = txt + id[k]
            }
            if (k < 4) {
                txt2 = txt2 + id[k]
            }

        }
        // console.log("txt=", txt)
        // console.log("txt2=", txt2)
        if (txt == "files" || txt2 == 'file' || spID == id) {
            const file = tmp[j].text
            // let data= []
            // console.log('file==', file)
            let imgList = file.split(',')
            if (imgList.length > 0) {
                for (let i = 0; i < imgList.length; i++) {
                    const img = imgList[i].split('.')
                    // console.log("img=", img)
                    if (img.length > 0) {
                        if (img[img.length - 1] == 'jpg' || img[img.length - 1] == 'png' || img[img.length - 1] == 'jpeg' || img[img.length - 1] == 'JPG' || img[img.length - 1] == 'JPEG') {
                            one.push(imgList[i])
                            imgData.push(tmp2)
                        }
                    }
                }
            }
            break
        }
    }
    return one
}

let oldNum = 2
document.addEventListener('DOMContentLoaded', function() {
    let infoIcon = document.querySelector('.gg-info');
    let tooltip = document.getElementById('customTooltip');
    oldColumn = column_num2
    column_num2.style.backgroundColor = 'lightblue'
    infoIcon.addEventListener('mouseover', function(e) {
        tooltip.style.display = 'block';
        // tooltip.style.left = e.pageX + 'px';
        // tooltip.style.top = e.pageY - 30 + 'px'; // 調整工具提示的位置
        // tooltip.textContent = infoIcon.getAttribute('title');
    });

    infoIcon.addEventListener('mouseout', function() {
        tooltip.style.display = 'none';
    });

    column_num1.onclick = function() {

        if (columnNum != 1) {
            oldNum = columnNum

            columnNum = 1
            resetColumn()
            column_num1.style.backgroundColor = 'lightblue'
            oldColumn = column_num1

        } else {
            column_num1.style.backgroundColor = ''
            columnNum = 0
            oldColumn = 'none'
        }

    }

    column_num2.onclick = function() {

        if (columnNum != 2) {
            oldNum = columnNum

            columnNum = 2
            resetColumn()
            column_num2.style.backgroundColor = 'lightblue'
            oldColumn = column_num2
        } else {
            column_num2.style.backgroundColor = ''
            columnNum = 0
            oldColumn = 'none'
        }

    }
    column_num3.onclick = function() {

        if (columnNum != 3) {
            oldNum = columnNum

            columnNum = 3
            resetColumn()

            column_num3.style.backgroundColor = 'lightblue'
            oldColumn = column_num3
        } else {
            column_num3.style.backgroundColor = ''
            columnNum = 0
            oldColumn = 'none'
        }

    }
    column_num4.onclick = function() {

        if (columnNum != 4) {
            oldNum = columnNum

            columnNum = 4
            resetColumn()
            column_num4.style.backgroundColor = 'lightblue'
            oldColumn = column_num4
        } else {
            column_num4.style.backgroundColor = ''
            columnNum = 0
            oldColumn = 'none'
        }

    }
    // var checkbox = document.getElementById('all_item_input');

    // checkbox.addEventListener('change', function() {
    //     if (this.checked) {
    //         console.log('allitem is checked.');
    //         // 在這裡添加你需要執行的代碼
    //     } else {
    //         console.log('allitem is unchecked.');
    //         // 在這裡添加你需要執行的代碼
    //     }
    // });

});

function resetColumn() {
    if (oldColumn != 'none') {
        oldColumn.style.backgroundColor = ''

        content.innerHTML = ''
        setImage()
        oldNum = columnNum
        // for (let k = 0; k < allImg.length; k++) {
        //     let div = document.getElementById("img_div_" + k)
        //     let img = document.getElementById('img_' + k)
        //     let div2 = document.getElementById('img_div2_' + k)




        //     if (oldNum == 1) {
        //         div.classList.remove("item_img1")
        //     }
        //     if (oldNum == 2) {
        //         div.classList.remove("item_img2")
        //     }
        //     if (oldNum == 3) {
        //         div.classList.remove("item_img3")
        //     }
        //     if (oldNum == 4) {
        //         div.classList.remove("item_img4")
        //     }
        //     if (columnNum == 1) {
        //         div.className = "item_img1"
        //         oldNum = 1
        //     }
        //     if (columnNum == 2) {
        //         div.className = "item_img2"
        //         oldNum = 2
        //     }
        //     if (columnNum == 3) {
        //         div.className = "item_img3"
        //         oldNum = 3
        //     }
        //     if (columnNum == 4) {
        //         div.className = "item_img4"
        //         oldNum = 4
        //     }

        //     if (k >= columnNum * 2) {
        //         if (k % (columnNum * 2) == 0) {
        //             let div4 = document.createElement('div')
        //             div4.className = 'title'
        //             let h2 = document.createElement('h2')
        //             let h3 = document.createElement('h3')
        //             h2.className = 'title_text'
        //             h3.className = 'subTitle'
        //             h2.innerHTML = title_text.innerHTML
        //             h3.innerHTML = subTitle.innerHTML
        //             div4.appendChild(h2)
        //             div4.appendChild(h3)
        //             content.appendChild(div4)
        //         }

        //     }

        //     const w = img.offsetWidth
        //     const h = img.offsetHeight
        //     const w1 = div2.offsetWidth
        //     const h1 = div2.offsetHeight
        //     const rate = h / w
        //     const rate1 = h1 / w1
        //     // console.log('rate=',rate)
        //     // console.log('rate1=',rate1)

        //     if (rate > rate1) {
        //         img.style.width = "auto"
        //         img.style.height = "96%"

        //     } else {
        //         img.style.height = "auto"
        //         img.style.width = "96%"
        //         // const dh = h1 - 
        //     }
        //     // const nw = img.offsetWidth
        //     // const nh = img.offsetHeight
        //     // console.log('nw=',nw)
        //     // console.log('w1=',w1)
        //     // console.log('nh=',nh)
        //     // console.log('h1=',h1)

        // }
        // oldColumn = "none"
        // columnNum = 0
    }
}

// monday.listen("context", res => {
//   console.log('context=',res)
//   boardId = res.data.boardId
//   console.log("boardid111=",res.data.boardId);
//   //使用範例
//     filterItems(); 
//   // do Something
// })


monday.get('context').then(res => {
    console.log('context2=', res)
    boardId = res.data.boardId
    // title1 = localStorage.getItem("title1_" + boardId)
    // title2 = localStorage.getItem('title2_' + boardId)
    // console.log('title1==', title1)
    // console.log('title2==', title2)

    // if (title1 != null) {
    //     title_text.innerHTML = title1
    //     print_title_input.value = title1
    // }
    // if (title2 != null) {
    //     subTitle.innerHTML = title2
    //     print_title_input2.value = title2
    // }

    // console.log("boardid=", res.data.boardId);
    //使用範例
    filterItems();
});

function setItem(n) {
    let content = filterID(n)
    for (let i = 0; i < filterID.length; i++) {
        if (i == n) {
            all_item[i] = "none"
        }
    }

}
// async function settingItems(boardId) {
//     const query = `
//  query {
//     boards(ids: 6292532342) {
//       items_page {
//         items {
//           id
//           name
//           column_values {
//             id
//             text
//             value
//           }
//         }
//       }
//     }
//  }
//  `;

//     // 使用monday SDK來執行GraphQL查詢
//     const response = await monday.api(query);

//     // 檢查查詢是否成功
//     if (!response.data) {
//         throw new Error('查詢失敗');
//     }

//     // 返回查詢結果中的項目
//     return response.data.boards[0].items_page.items;
// }

// async function filterItems(boardId, filterField, filterValue) {
//     // 抓取項目
//     const settingList = await settingItems(boardId);
//     console.log("settingList===", settingList)
//     // 過濾項目

// }

// //使用範例
// filterItems(6292532342, 'Status', 'In Progress');


//a4 : 72解析度 595/842

function generatePDF() {
    // const url = "print.html?"+"columnNum=" + columnNum + "&iurl=" + allImg + "&data=aaa" 
    // window.open(url, '_blank');
    // window.location.href = url
    // all.style.height = "auto"
    // var content = $('#content_all').html();
    //     var pageHeight = 842; // A4 紙張的高度，以像素為單位
    //     var contentHeight = $('#content_all').height();
    //     console.log("contentHeight==",contentHeight)
    //     var pages = Math.ceil(contentHeight / pageHeight);

    //     var newWin = window.open('', '_blank');
    //     newWin.document.open();
    //     newWin.document.write('<html><head><title>Print</title>');
    //     newWin.document.write('<link rel="stylesheet" type="text/css" href="style.css">');
    //     newWin.document.write('</head><body>');
    //     for (var i = 0; i < pages; i++) {
    //         var pageContent = content.slice(i * pageHeight, (i + 1) * pageHeight);
    //         newWin.document.write('<div class="print-content">' + pageContent + '</div>');
    //     }

    //     newWin.document.write('</body></html>');
    //     // newWin.document.close();
    //      newWin.print();

    var divToPrint = document.getElementById('content_all');
    var newWin = window.open('', '_blank');
    newWin.document.open();
    newWin.document.write('<html><head><title>Print</title>')
    newWin.document.write('<link rel="stylesheet" type="text/css" href="style.css">');
    // newWin.document.write('</head><body onload="window.print()">');
    newWin.document.write('</head><body>');
    // newWin.document.write('<html><head><title>Print</title></head><body>');
    newWin.document.write('<div class="print-content">' + divToPrint.innerHTML + '</div>');
    newWin.document.write('<button id="pdf_btn" onclick="goPrint()">列  印</button>')
    newWin.document.write('<div id="loader" style="z-index: 900"><img src="loading.svg"></div>')
    newWin.document.write('<script src="print.js"></script>');
    newWin.document.write('</body></html>');
    newWin.document.close();


    // all.style.height = "100vh"

    // var divToPrint = document.getElementById('all');
    //         var newWin = window.open('', '_blank');
    //         newWin.document.open();
    //         newWin.document.write('<html><head><title>Print</title></head><body>');
    //         newWin.document.write($('#all').html() );
    //         newWin.document.write('</body></html>');
    //         // newWin.document.close();
    //         newWin.print();
    // $("#all").printElement();


    // const divId = 'all'
    //    var newWin=window.open('','列印視窗');
    // newWin.document.open();
    // newWin.document.write('<html>'+
    //   '<head>'+
    //     '<link rel="stylesheet" href="style.css">'+
    //   '</head>'+
    //   '<body  onload="window.print()">'+
    //     $('#all').html()+
    //   '</body>'+
    // '</html>');
    // newWin.document.close();
    // setTimeout(function(){newWin.close();},10);

    // // 獲取要轉換的 HTML 元素
    // var node = document.getElementById('all');

    // 使用 dom-to-image 库將 HTML 元素轉換為圖像
    // domtoimage.toPng(node)
    //     .then(function(dataUrl) {
    //         // 創建 PDF 實例
    //         var pdf = new jsPDF('p', 'mm', 'a4');

    //         // 添加圖像到 PDF 中
    //         pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297); // 210x297 是 A4 尺寸

    //         // 保存 PDF
    //         pdf.save('htmltopdf_' + new Date().getTime() + '.pdf');
    //     })
    //     .catch(function(error) {
    //         console.error('圖像轉換錯誤:', error);
    //     });

    // var html_content = $('#all').html();
    // $("#download").contents().find("#wrapper").html(html_content);

    // // 使用html2canvas轉換HTML內容為Canvas
    // html2canvas($('#download').get(0)).then(function(canvas) {
    //     var imgData = canvas.toDataURL('image/png');
    //     console.log('imgData=',imgData)
    //     var pdf = new jsPDF('p','pt','a4');
    //     pdf.internal.scaleFactor = 2;
    //     var imgWidth = 210; // A4 width in mm
    //     var imgHeight = canvas.height * imgWidth / canvas.width;
    //     pdf.addImage(imgData, 'PNG', 15, 15, imgWidth, imgHeight);
    //     pdf.save('htmltopdf_' + new Date().getTime() + '.pdf');
    // });

    //   const divId = "all"
    //   let mywindow = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');

    // mywindow.document.write(`<html><head>`);
    // mywindow.document.write('</head><body >');
    // mywindow.document.write(document.getElementById(divId).innerHTML);
    // mywindow.document.write('</body></html>');

    // mywindow.document.close(); // necessary for IE >= 10
    // mywindow.focus(); // necessary for IE >= 10*/

    // mywindow.print();
    // mywindow.close();

    // trans.style.visibility = 'visible'
    // let doc = new jsPDF()
    // const divId = "all"
    // doc.fromHTML(`<html><head></head><body>` + document.getElementById(divId).innerHTML + `</body></html>`);
    // doc.save('sample.pdf');
    // trans.style.visibility = 'hidden'
    // var pdf = new jsPDF();

    // var divs = document.querySelectorAll('.image_box');
    // var pdfCounter = 0;


    // // 生成 PDF 函數
    // function generatePdf() {
    //     // 如果還有子 div 沒有處理，則處理下一個子 div
    //     console.log("pdfCounter==",pdfCounter)
    //     console.log('divs.length==',divs.length)
    //     if (pdfCounter < divs.length) {
    //         var div = divs[pdfCounter];

    //         // 獲取子 div 內的圖片 URL
    //         // 獲取子 div 內的圖片
    //         var img = div.querySelector('img');
    //         // img.crossOrigin = "Anonymous";
    //         // 確保圖片存在
    //         if (img) {
    //             // 獲取圖片 URL
    //             var imgUrl = img.src;
    //             console.log("src=", imgUrl)
    //             console.log("endsWith=", imgUrl.toLowerCase().endsWith('.jpg'))
    //             // 檢查圖片格式
    //             if ( imgUrl.toLowerCase().endsWith('.jpeg')) {
    //                 // 圖片是 JPEG 格式，直接添加到 PDF 中
    //                 pdf.addImage(imgUrl, 'JPEG', 10, 10 + pdfCounter * 150, 180, 150); // 調整位置和大小
    //                 pdfCounter++;
    //                 generatePdf();
    //             } else if (imgUrl.toLowerCase().endsWith('.jpg')) {
    //                 // 圖片是 PNG 格式，使用 html2canvas 將圖片轉換為 JPEG 格式
    //                 html2canvas(img).then(function(canvas) {
    //                     var imgUrlData = canvas.toDataURL('image/jpeg');

    //                     // 添加圖片到 PDF 中
    //                     pdf.addImage(imgUrlData, 'JPEG', 10, 10 + pdfCounter * 150, 180, 150); // 調整位置和大小
    //                     pdfCounter++;
    //                     generatePdf();
    //                 });
    //             } else if (imgUrl.toLowerCase().endsWith('.png')) {
    //                 // 圖片是 PNG 格式，使用 html2canvas 將圖片轉換為 JPEG 格式
    //                 html2canvas(img).then(function(canvas) {
    //                     var imgUrlData = canvas.toDataURL('image/jpeg');

    //                     // 添加圖片到 PDF 中
    //                     pdf.addImage(imgUrlData, 'JPEG', 10, 10 + pdfCounter * 150, 180, 150); // 調整位置和大小
    //                     pdfCounter++;
    //                     generatePdf();
    //                 });
    //             } else {
    //                 // 其他格式的圖片，忽略並處理下一張圖片
    //                 pdfCounter++;
    //                 generatePdf();
    //             }
    //         }
    //     } else {
    //         // 如果所有圖片都添加完成，則將 PDF 下載到本地
    //         trans.style.visibility = 'hidden'
    //         pdf.save('example.pdf');
    //     }
    // }

    // // 開始生成 PDF
    // generatePdf();

    // async function generatePDF() {
    //     var doc = new jsPDF();
    //     var imgWidth = 210; // A4 width in mm
    //     var pageHeight = 295; // A4 height in mm
    //     var position = 0;

    //     var imageContainers = document.querySelectorAll('.image_box');
    //     for (let container of imageContainers) {
    //         await html2canvas(container).then(function(canvas) {
    //             var imgData = canvas.toDataURL('image/png');
    //             var imgHeight = canvas.height * imgWidth / canvas.width;
    //             doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    //             position += imgHeight;

    //             if (position > pageHeight) {
    //                 doc.addPage();
    //                 position = 0;
    //             }
    //         });
    //     }
    //     trans.style.visibility = 'hidden'
    //     doc.save('sample.pdf');
    // }


    // const element = document.getElementById('all')

    // html2canvas(element).then(function(canvas) {
    //     var imgData = canvas.toDataURL('image/png');
    //     var doc = new jsPDF('p', 'mm', 'a4'); // 使用A4紙張大小
    //     var imgWidth = 210; // A4 width in mm
    //     var pageHeight = 295; // A4 height in mm
    //     var imgHeight = canvas.height * imgWidth / canvas.width;
    //     var heightLeft = imgHeight;
    //     var position = 0;

    //     // 添加第一頁
    //     doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    //     heightLeft -= pageHeight;

    //     // 如果內容超過一頁，則添加更多頁面
    //     while (heightLeft >= 0) {
    //         position = heightLeft - imgHeight;
    //         doc.addPage();
    //         doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    //         heightLeft -= pageHeight;
    //     }
    //     doc.save('sample.pdf');
    //     trans.style.visibility = 'hidden'
    // });

}