<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="企业名称" prop="companyName">
        <el-input
          v-model="queryParams.companyName"
          placeholder="企业名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="信用代码" prop="uniHonestCode">
        <el-input
          v-model="queryParams.uniHonestCode"
          placeholder="信用代码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="法人姓名" prop="lawmanName">
        <el-input
          v-model="queryParams.lawmanName"
          placeholder="法人"
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
          v-hasPermi="['system:bancompany:add']"
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
          v-hasPermi="['system:bancompany:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:bancompany:export']"
        >导出</el-button>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="el-icon-upload"
            size="mini"
            @click="openImportDialog"
          >上传自excel</el-button>
        </el-col>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
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

    <el-table v-loading="loading" :data="bancompanyList" @selection-change="handleSelectionChange" ref="table">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="上报日期" align="center" prop="publishDate" width="180">
        <template v-slot:="scope">
          <span>{{ parseTime(scope.row.publishDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="企业名称" align="center" prop="companyName" />
      <el-table-column label="信用代码" align="center" prop="uniHonestCode" />
      <el-table-column label="法人" align="center" prop="lawmanName" />
      <el-table-column label="委托人" align="center" prop="agentName" />
      <el-table-column label="身份证号（委）" align="center" prop="agentId" />
      <el-table-column label="不合格原因" align="center" prop="failReason" />
      <el-table-column label="备注" align="center" prop="notes" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:bancompany:edit']"
          >修改</el-button>
        </template>
      </el-table-column>
    </el-table>

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

    <!-- 添加或修改中国中铁不合格分包企业名录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上报日期" prop="publishDate">
           <el-date-picker clearable
                          v-model="buff_form.publishDate"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择上报日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="企业名称" prop="companyName">
          <el-input v-model="buff_form.companyName" placeholder="企业名称" />
        </el-form-item>
        <el-form-item label="信用代码" prop="uniHonestCode">
          <el-input v-model="buff_form.uniHonestCode" placeholder="信用代码" />
        </el-form-item>
        <el-form-item label="法人" prop="lawmanName">
          <el-input v-model="buff_form.lawmanName" placeholder="法人姓名" />
        </el-form-item>
        <el-form-item label="委托人" prop="agentName">
          <el-input v-model="buff_form.agentName" placeholder="委托人姓名" />
        </el-form-item>
        <el-form-item label="身份证号" prop="agentId">
          <el-input v-model="buff_form.agentId" placeholder="身份证号（委）" maxlength="18" show-word-limit  @blur="handleBlur(buff_form.agentId,bancompanyList,$message)"/>
        </el-form-item>
        <el-form-item label="原因" prop="failReason">
          <el-input v-model="buff_form.failReason" type="textarea" placeholder="不合格原因" />
        </el-form-item>
        <el-form-item label="备注" prop="Notes">
          <el-input v-model="buff_form.Notes" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listBanCompany, getBanCompany, delBanCompany, addBanCompany, updateBanCompany } from "@/api/system/bancompany";
import {validateID} from "@/api/tool/id_test";
import {parseTime} from "@/utils/ruoyi";

export default {
  name: "Bancompany",
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
      // 中国中铁不合格分包企业名录表格数据
      bancompanyList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //是否显示导入页面
      importDialogVisible:false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        publishDate: null,
        companyName: null,
        uniHonestCode: null,
        lawmanName: null,
        agentName: null,
        agentId: null,
        failReason: null,
        Notes: null
      },
      selectedItems:[],
      //数据缓冲区
      buff_form:{},
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    parseTime,
    /** 查询中国中铁不合格分包企业名录列表 */
    openImportDialog() {
      this.importDialogVisible = true;
    },
    getList() {
      this.loading = true;
      listBanCompany(this.queryParams).then(response => {
        console.log("表单元素为"+JSON.stringify(response.rows));
        this.bancompanyList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        Id: null,
        publishDate: null,
        companyName: null,
        uniHonestCode: null,
        lawmanName: null,
        agentName: null,
        agentId: null,
        failReason: null,
        Notes: null
      };
      this.resetForm("form");
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
    handleBlur(IDNumber,bancompanyList,messageFn) {
      const result = validateID(IDNumber, bancompanyList,messageFn);

      if (!result.valid) {
        this.buff_form.agentId = ''; // 清空输入框内容
      }

      return result;
    },
    // 多选框选中数据
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
      this.bancompanyList.forEach(item => {
        item.checked = this.selectedItems.some(selected => selected.id === item.id);
      });
    },
    // 判断某项是否属于当前页
    isItemInCurrentPage(item) {
      return this.bancompanyList.some(pageItem => pageItem.id === item.id);
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
      const table = this.$refs.table
      const rowIndex = this.bancompanyList.findIndex(row => row.id === item.id);
      if (rowIndex !== -1) {
        table.toggleRowSelection(this.bancompanyList[rowIndex], false);
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加中国中铁不合格分包企业名录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const Id = row.id || this.ids
      getBanCompany(Id).then(response => {
        this.buff_form = response.data;
        this.open = true;
        this.title = "修改中国中铁不合格分包企业名录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form = this.buff_form
          if (this.form.id != null) {
            updateBanCompany(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBanCompany(this.form).then(response => {
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

      if(!this.bancompanyList.find(item => ids.includes(item.id))) {
        this.$message.error("请先选中")
        return;
      }
      this.$modal.confirm('以下数据将被删除："' + formattedIdName +'" 请确认').then(function() {
        return delBanCompany(ids);
      }).then(() => {
        this.selectedItems = [];
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
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
      this.download('/system/banCompany/export', {
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
      this.download('/system/banCompany/export', {
        selectedData: exportData
      }, fileName);
    },
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
