<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="姓名" prop="Name">
        <el-input
          v-model="queryParams.Name"
          placeholder="姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="身份证号" prop="IDNumber">
        <el-input
          v-model="queryParams.IDNumber"
          placeholder="身份证号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="PhoneNumber">
        <el-input
          v-model="queryParams.PhoneNumber"
          placeholder="手机号码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-upload"
          size="mini"
          @click="openImportDialog"
        >上传自excel</el-button>
      </el-col>
    </el-row>
    <div>
      <!-- 已选数据列表 -->
      <div class="selected-items">
        <h3>已选中数据：</h3>
        <el-tag
          v-for="item in getSelectedItems()"
          :key="item.id"
          closable
          @close="removeSelectedItem(item)"
        >
          {{ item.name }}
        </el-tag>
      </div>
    </div>


    <el-table v-loading="loading" :data="banfarmList" @selection-change="handleSelectionChange" ref="table">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="性别" align="center" prop="gender" />
      <el-table-column label="出生日期" align="center" prop="dateOfBirth" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.dateOfBirth, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年龄" align="center" prop="age" />
      <el-table-column label="民族" align="center" prop="ethnicity" />
      <el-table-column label="身份证号" align="center" prop="idnumber" />
      <el-table-column label="住址" align="center" prop="address" />
      <el-table-column label="手机号码" align="center" prop="phoneNumber" />
      <el-table-column label="工种" align="center" prop="jobStatus" />
      <el-table-column label="失信行为" align="center" prop="dishonestBehaviorDescription">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="showDetail(scope.row.dishonestBehaviorDescription)">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="所属公司" align="center" prop="company" />
      <el-table-column label="合同编号" align="center" prop="personalUnionAccount" />
      <el-table-column label="备注" align="center" prop="notes" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="失信行为描述"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleDialogClose"
    >
      <p>{{ currentDescription }}</p>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">关闭</el-button>
  </span>
    </el-dialog>
    <!-- 导入对话框 -->
    <el-dialog
      title="导入数据"
      :visible.sync="importDialogVisible"
      width="500px"
    >
      <el-upload
        class="upload-demo"
        drag
        multiple
        :limit="1"
        :on-exceed="handleExceed"
        :before-upload="beforeUpload"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        :action="url"
        name="file"
        :with-credentials="true"
        :headers="uploadHeaders"
      >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只支持xlsx、xls格式的Excel文件，
            <em @click="downloadTemplate" style="cursor: pointer; color: blue;">
              点击下载模板
            </em>
          </div>
      </el-upload>

      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改农民工黑名单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="Name">
          <el-input v-model="buff_form.Name" placeholder="中文姓名"  @blur="validateName"/>
        </el-form-item>
        <el-form-item label="身份证号" prop="IDNumber">
          <el-input v-model="buff_form.IDNumber" placeholder="身份证号" maxlength="18" show-word-limit  @blur="handleBlur(buff_form.IDNumber,banfarmList,$message)"/>
        </el-form-item>
        <!--性别身份证号得出-->
        <!--出生日期身份证号得出-->
        <!--年龄身份证号得出-->
        <el-form-item label="民族" prop="Ethnicity">
          <el-input v-model="buff_form.Ethnicity" placeholder="民族" />
        </el-form-item>
        <el-form-item label="住址" prop="Address">
          <el-input v-model="buff_form.Address" placeholder="住址" />
        </el-form-item>
        <el-form-item label="手机号码" prop="PhoneNumber">
          <el-input v-model="buff_form.PhoneNumber" placeholder="手机号码" maxlength="11" show-word-limit />
        </el-form-item>
        <!--工种是选项而不是输入-->
            <el-form-item label="工种" prop="jobStatus" placeholder="输入或选择工种">
                <el-select
                  v-model="buff_form.JobStatus"
                  placeholder="输入/选择工种"
                  filterable
                  allow-create
                  @change="handleJobChange"
                >
                <el-option
                  v-for="item in jobOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- 提交按钮 -->

        <el-form-item label="失信行为" prop="DishonestBehaviorDescription">
          <el-input v-model="buff_form.DishonestBehaviorDescription" type="textarea" placeholder="内容" />
        </el-form-item>
        <el-form-item label="所属公司" prop="Company">
          <el-input v-model="buff_form.Company" placeholder="所属公司" />
        </el-form-item>
        <el-form-item label="合同编号" prop="PersonalUnionAccount">
          <el-input v-model="buff_form.PersonalUnionAccount" placeholder="合同编号" />
        </el-form-item>
        <el-form-item label="备注" prop="Notes">
          <el-input v-model="buff_form.Notes" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm(buff_form,buff_form.IDNumber)">确 定</el-button>
        <el-button @click="cancel">取 消</el-button> <!--取消的时候要保存用户输入-->
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {addBanfarm, delBanfarm, getBanfarm, listBanfarm, updateBanfarm} from "@/api/system/banfarm";
import Cookies from 'js-cookie';
import {validateID} from "@/api/tool/id_test";


export default {
  name: "Banfarm",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 农民工黑名单表格数据
      banfarmList: [],
      // 全局选中表单数据
      selectedItems:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 导入数据url
      url: process.env.VUE_APP_BASE_API + "/system/banfarm/importData",
      //导入对话框是否可视
      importDialogVisible: false,
      uploadHeaders: {
        // 例如如果需要token认证，可在此添加Authorization头
        // "Authorization": "Bearer " + getToken() // 假设有个getToken函数
        Authorization: "Bearer " + Cookies.get('Admin-Token')
      },

      dialogVisible: false, // 对话框是否显示
      currentDescription: "", // 当前选中的失信行为描述

      //工种
      jobOptions:[{value:"架子工",label:"架子工"}],

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        Name: null,
        Gender: null,
        DateOfBirth: null,
        Age: null,
        Ethnicity: null,
        IDNumber: null,
        Address: null,
        PhoneNumber: null,
        JobStatus: null,
        DishonestBehaviorDescription: null,
        Company: null,
        PersonalUnionAccount: null,
        Notes: null
      },
      // 缓冲表单参数
      buff_form: {},
      // 真正的表单
      form:{},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    validateID,
    handleBlur(IDNumber,banfarmList,messageFn) {
        const result = validateID(IDNumber, banfarmList,messageFn);

        if (!result.valid) {
          this.buff_form.IDNumber = ''; // 清空输入框内容
        }

        return result;
      },

    /** 查询农民工黑名单列表 */
    getList() {
      this.loading = true;
      listBanfarm(this.queryParams).then(response => {
        this.banfarmList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 显示对话框并设置内容
    showDetail(description) {
      this.currentDescription = description;
      this.dialogVisible = true;
    },
    // 关闭对话框时清空内容
    handleDialogClose() {
      this.currentDescription = "";
      this.dialogVisible = false;
    },
    openImportDialog() {
      this.importDialogVisible = true;
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        Name: null,
        Gender: null,
        DateOfBirth: null,
        Age: null,
        Ethnicity: null,
        IDNumber: null,
        Address: null,
        PhoneNumber: null,
        JobStatus: null,
        DishonestBehaviorDescription: null,
        Company: null,
        PersonalUnionAccount: null,
        Notes: null
      };
      this.resetForm("form");
    },
    // 处理新增工种逻辑
    handleJobChange(value) {
      // 判断输入的值是否已存在于工种选项中
      const exists = this.jobOptions.some((item) => item.value === value || item.label === value);
      if (!exists) {
        // 如果不存在，则新增选项
        const newOption = { value: value, label: value };
        this.jobOptions.push(newOption);
      }
    },
    /**根据身份证计算个人基本信息*/
    getBaseInfo(form,Id)
    {
      let raw_DOB    = Id.substring(6,14)
      let raw_Gender = Id[16]

      // 提取年份、月份和日期
      const year  = parseInt(raw_DOB.substring(0, 4),10)
      const month = parseInt(raw_DOB.substring(4, 6),10)
      const day   = parseInt(raw_DOB.substring(6, 8),10)

      //计算出生日期,性别
      let DOB     = year + "-" + month + "-" + day;
      let gender  = (parseInt(raw_Gender,10) % 2 === 1) ? "男" : "女"

      // 获取当前时间
      let date = new Date();
      let thisYear  = date.getFullYear();
      let thisMonth = date.getMonth() + 1;
      let thisDay   = date.getDate();

      let indexT = thisMonth * 100 + thisDay;
      let indexP = month * 100 + day;
      let index  = indexT >= indexP ? 0 : 1; // index = 0 今年过生日了，1 没有


      form.Age         = thisYear - year - index;
      form.Gender      = gender;
      form.DateOfBirth = DOB;

    },
    /** 姓名输入校验操作 */
    validateName() {
      // 检查输入是否为中文
      const chineseRegex = /^[\u4e00-\u9fa5]*$/; // 只允许中文字符
      if (!chineseRegex.test(this.buff_form.Name) && this.buff_form.Name !== undefined) {
        this.$message.error('只能输入中文字符');
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加农民工黑名单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const id = row.id || this.ids;
      getBanfarm(id).then(response => {
        this.buff_form = response.data;
        this.open = true;
        this.title = "修改农民工黑名单";
      });
    },

    /** 提交按钮 */
    submitForm(form,id) {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 注入基本信息
          this.getBaseInfo(form,id)
          //缓冲区内容注入真实表单
          this.form = this.buff_form
          if (this.form.id != null) {
            updateBanfarm(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBanfarm(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      const delList = this.selectedItems.filter(item => ids.includes(item.id));

      // 将 ids 和 delList 合并成键值对
      const id_name = delList.reduce((acc, item) => {
        if (ids.includes(item.id)) {
          acc[item.id] = item.name; // 假设 delList 的元素包含 id 和 name 属性
        }
        return acc;
      }, {});
      const formattedIdName = Object.entries(id_name)
        .map(([id, name]) => `${id}: ${name}`)
        .join(', ');

      if(!this.banfarmList.find(item => ids.includes(item.id))) {
        this.$message.error("请先选中")
        return;
      }
      this.$modal.confirm('以下数据将被删除："' + formattedIdName +'" 请确认').then(function() {
        return delBanfarm(ids);
      }).then(() => {
        this.selectedItems = [];
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },

    //验证是否出现重复身份证
    hasDuplicatedIDNumber()
    {
      //得到所有人身份证信息
      const idNumbers = this.banfarmList.map(item => item.IDNumber)
      // 统计出现次数
      const duplicates = idNumbers.reduce((acc,id) =>
      {
        acc[id] = (acc[id] || 0) +1;
        return acc;
      },{});
      // 筛选出出现次数大于 1 的元素
      const result = Object.entries(duplicates)
        .filter(([id, count]) => count > 1)
        .map(([id]) => id);

      if(result !== undefined)
      {
        this.$message.error("出现相同的身份证号,请搜索确认" + result)
        return false;
      }
      else
        return true;
    },

    // 处理选中项变化
    handleSelectionChange(selection) {
      // 将当前页选中的项加入全局 `selectedItems`
      selection.forEach(item => {
        if (!this.selectedItems.find(selected => selected.id === item.id)) {
          this.selectedItems.push(item);
        }
      });

      // 将取消选择的项从全局 `selectedItems` 中移除
      const currentIds = selection.map(item => item.id);
      this.selectedItems = this.selectedItems.filter(item => {
        return currentIds.includes(item.id) || !this.isItemInCurrentPage(item);
      });

      // 更新其他相关状态
      this.ids = this.selectedItems.map(item => item.id);
      this.single = this.selectedItems.length !== 1;
      this.multiple = !this.selectedItems.length;

      // 更新当前页数据的选中状态
      this.banfarmList.forEach(item => {
        item.checked = this.selectedItems.some(selected => selected.id === item.id);
      });
    },
    // 判断某项是否属于当前页
    isItemInCurrentPage(item) {
      return this.banfarmList.some(pageItem => pageItem.id === item.id);
    },
    // 展示选中的数据
    getSelectedItems() {
      return this.selectedItems;
    },
    removeSelectedItem(item){
      // 移除选中项
      this.selectedItems = this.selectedItems.filter(
        selected => selected.id !== item.id
      );
      // 更新表格选中状态
      const table = this.$refs.table;
      const rowIndex = this.banfarmList.findIndex(row => row.id === item.id);
      if (rowIndex !== -1) {
        table.toggleRowSelection(this.banfarmList[rowIndex], false);
      }
    },
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        this.$message.error('只支持Excel文件上传!');
      }
      return isExcel;
    },
    handleExceed(files, fileList) {
      this.$message.warning('只能上传1个文件，请删除多余文件');
    },
    handleImportSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$message.success('导入成功');
        this.importDialogVisible = false;
        this.getList(); // 导入成功后刷新列表
      } else {
        this.$message.error(response.msg || '导入失败');
      }
    },
    handleImportError(err, file, fileList) {
      this.$message.error('导入失败，请检查文件格式或服务器异常');
    },
    /** 导出按钮操作 */
    handleExport() {
      // 获取选中的行
      const selectedRows = this.selectedItems.filter(item => item.checked);

      if (selectedRows.length === 0) {
        this.$message.error('请先选中要到导出的条目');
        return;
      }

      // 准备导出的数据
      const exportData = selectedRows.map(row => ({
        id: row.id,
        Name: row.Name,
        Gender: row.Gender,
        DateOfBirth: row.DateOfBirth,
        Age: row.Age,
        Ethnicity: row.Ethnicity,
        IDNumber: row.IDNumber,
        Address: row.Address,
        PhoneNumber: row.PhoneNumber,
        JobStatus: row.JobStatus,
        DishonestBehaviorDescription: row.DishonestBehaviorDescription,
        Company: row.Company,
        PersonalUnionAccount: row.PersonalUnionAccount,
        Notes: row.Notes
      }));

      // 获取当前时间并格式化
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;

// 动态生成文件名
      const fileName = `${formattedDate}农民工黑名单列表.xlsx`;

// 调用下载方法
      this.download('/system/banfarm/export', {
        selectedData: exportData
      }, fileName);
    },

    downloadTemplate() {
      // 获取选中的行
      const selectedRows = [];

      // 准备导出的数据
      const exportData = selectedRows.map(row => ({
        id: row.id,
        Name: row.Name,
        Gender: row.Gender,
        DateOfBirth: row.DateOfBirth,
        Age: row.Age,
        Ethnicity: row.Ethnicity,
        IDNumber: row.IDNumber,
        Address: row.Address,
        PhoneNumber: row.PhoneNumber,
        JobStatus: row.JobStatus,
        DishonestBehaviorDescription: row.DishonestBehaviorDescription,
        Company: row.Company,
        PersonalUnionAccount: row.PersonalUnionAccount,
        Notes: row.Notes
      }));

      const fileName = `黑名单填写样板.xlsx`;

// 调用下载方法
      this.download('/system/banfarm/export', {
        selectedData: exportData
      }, fileName);
    }
  }
};
</script>



<style scoped>
.upload-demo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px; /* 根据需要调整高度 */
  border: 2px dashed #d9d9d9; /* 自定义边框样式 */
  border-radius: 6px; /* 圆角 */
  cursor: pointer;
  transition: border-color 0.3s;
}


.el-upload__text {
  text-align: center;
  font-size: 16px; /* 根据需要调整字体大小 */
}

.el-upload__text em {
  color: #409eff; /* 突出显示的文本颜色 */
}
.el-upload__tip em {
  color:#409eff;
}

</style>
