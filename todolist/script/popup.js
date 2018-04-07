(function () {
    const $inputTodo = $("#inputTodo");
    const $todoList = $("#todoList");
    const $countNum = $("#countNum");

    let _currentTodos = [];

    //添加事件
    $inputTodo.keyup(function (e) {
        var _value = $(this).val();
        if (e.keyCode === 13 && _value !== '') {
            if (Array.isArray(_currentTodos)) {
                _currentTodos = _currentTodos.concat(_value);
            } else {
                _currentTodos = [].concat(_value);
            }

            //存储 todos
            setStorage(function () {
                //清空输入框
                $inputTodo.val('');

                $todoList.append(renderItem(_value));
                $countNum.text(parseInt($countNum.text()) + 1);

                //绑定删除事件
                $('li:last', $todoList).find('.destroy').click(function(){
                    handleRemove($('.destroy').index($(this)), $(this).parents('li'));
                });
            });
        }
    })

    //页面加载就初始化
    function getStorage() {
        //获取 todos
        chrome.storage.sync.get(['todos'], function (result) {
            _currentTodos = result.todos;

            //渲染
            render(_currentTodos);

            //footer
            displayFooter();
        });
    }

    //存储 todos
    function setStorage(callback) {
        chrome.storage.sync.set({ todos: _currentTodos }, function () {
            callback && callback();
        });
    }

    //处理删除事件
    function handleRemove(index, parentDom) {
        _currentTodos.splice(index, 1);

        //存储 todos
        setStorage(function () {
            parentDom.remove();
            $countNum.text(parseInt($countNum.text()) - 1);

            //footer
            displayFooter();
        });
    }

    //编辑 todo
    function editTodo(destroyDom) {
        destroyDom.dblclick(function (e) {
            const _this = $(this);
            const _edit = _this.find('.edit');

            //首页这里要注意 addClass 和 focus 的顺序一定不能变
            //原因：默认 .edit 对应的元素是隐藏的，对其设置 focus 是无效的
            const _editVal = _edit.val();
            _this.addClass('editing');

            //这里先置空再设置 focus 是为让光标至于文本末尾
            _edit.val('').focus().val(_editVal);

            _edit.keyup(function (e) {
                const _value = $(this).val();
                const _index = $('li').index(_this);
                if (e.keyCode === 13) {
                    if (_value === '') {
                        handleRemove(_index, _this);
                    }else{
                        _currentTodos[_index] = _value;

                        //存储 todos
                        setStorage(function () {
                            _this.removeClass('editing');
                            _this.find('.label').text(_value);
                        });
                    }
                }
            }).blur(function(){
                _this.removeClass('editing');
            });
        });
    }

    //隐藏显示 footer
    function displayFooter() {
        const $footer = $('#footer');

        if ($footer.is(':hidden') && _currentTodos.length > 0) {
            $footer.show();
        } else if ($footer.is(':visible') && _currentTodos.length === 0) {
            $footer.hide();
        }
    }

    //渲染整个列表
    function render(todoList) {
        let strHtml = '';
        let length = 0;
        if (Array.isArray(todoList) && todoList.length > 0) {
            length = todoList.length;
            todoList.map(todo => {
                strHtml += renderItem(todo);
            });
        }

        $todoList.html(strHtml);
        $countNum.text(length);

        //绑定删除事件
        $('.destroy').click(function(){
            handleRemove($('.destroy').index($(this)), $(this).parents('li'));
        });

        //绑定编辑
        editTodo($('.todo'));
    }

    //渲染单条数据
    function renderItem(text) {
        return `
            <li class="todo">
                <div class="view">
                    <input type="checkbox" class="toggle"/>
                    <label class="label">${text}</label>
                    <a class="destroy"></a>
                </div>
                <input type="text" value="${text}" class="edit"/>
            </li>
        `
    }

    //初始化
    getStorage();
})()