<template>
  <div class="table-wrapper">
    <a-form layout="inline">
      <a-row :gutter="48">
        <a-col :md="6" :sm="24">
          <a-form-item label="位置">
            <a-select placeholder="请选择位置" v-model="queryParam.sliderType">
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="item in positionList" :value="item.name" :key="item.name">{{ item.desc }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :md="8" :sm="24">
          <span class="table-page-search-submitButtons">
            <a-button type="primary" @click="showLoadingMore()">查询</a-button>
          </span>
        </a-col>
      </a-row>
    </a-form>
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleAdd()">添加</a-button>
    </div>

    <s-table
      :rowKey="(record) => record.id"
      :columns="columns"
      :data="dataList"
      ref="table"
    >
      <span slot="pic" slot-scope="text">
        <img :src="text" alt="" class="img-list">
      </span>
      <span slot="target" slot-scope="text">
        <a :href="text" target="_blank">{{ text }}</a>
      </span>
      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-popconfirm title="确认要删除吗？" @confirm="() => handleDel(record)">
          <a class="btn-red">删除</a>
        </a-popconfirm>
      </span>
    </s-table>
    <a-modal
      :title="title"
      style="top: 20px;"
      :width="650"
      v-model="visible"
      @ok="handleOk"
    >
      <a-form :form="form" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
        <a-form-item v-show="false">
          <a-input v-decorator="['id']"/>
        </a-form-item>
        <a-form-item label="名称">
          <a-input
            v-decorator="['title', { rules: [{ required: true, message: '请输入名称' }] }]"/>
        </a-form-item>
        <a-form-item label="位置">
          <a-radio-group v-decorator="['sliderType', { rules: [{ required: true, message: '请选择类型' }] }]" @change="changePos">
            <a-radio :value="item.name" v-for="(item,idx) in positionList" :key="idx">{{ item.desc }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="跳转地址">
          <a-input v-decorator="['target', { rules: [{ required: true, message: '请输入地址' }] }]"/>
        </a-form-item>
        <a-form-item label="图片" v-show="sliderType != 'NAV_TUI'">
          <s-upload ref="imgUpload" @change="handleChange" :code="uploadData.code" source="SLIDER"/>
          <span style="vertical-align: top;">{{ tips }}</span>
          <a-input v-decorator="['pic']"/>
        </a-form-item>
        <a-form-item label="图片" v-show="sliderType === 'NAV_TUI'">
          <a-input v-decorator="['pic', { rules: [{ required: true, message: '请输入地址' }] }]"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { STable, ImgUpload } from '@/components'
import { getSliderList, delSlider, saveSlider, listSliderPosition } from '@/api/content'

export default {
  name: 'TableList',
  components: {
    STable,
    SUpload: ImgUpload
  },
  data () {
    return {
      visible: false,
      form: this.$form.createForm(this),
      loading: false,
      loadingMore: false,
      queryParam: {},
      data: [],
      imageUrl: '',
      uploadData: {
        source: 1,
        code: ''
      },
      positionList: [],
      sliderType: 0,
      tips: '',
      title: '新增',
      columns: [
        {
          title: '图片',
          dataIndex: 'pic',
          width: 200,
          scopedSlots: { customRender: 'pic' }
        }, {
          title: '标题',
          dataIndex: 'title'
        }, {
          title: '地址',
          dataIndex: 'target',
          width: 350,
          scopedSlots: { customRender: 'target' }
        }, {
          title: '位置',
          dataIndex: 'sliderType.desc',
          width: 120
        }, {
          title: '状态',
          dataIndex: 'sliderStatus',
          width: 120,
          customRender: (it, row) => {
            return <a-switch checked-children="生效" un-checked-children="失效" defaultChecked={it === 0} on-change={(p) => this.changeStatus(p, row)} />
          }
        }, {
          title: '创建时间',
          dataIndex: 'updateTime',
          width: 180
        }, {
          title: '操作',
          width: '150px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      dataList: (parameter) => {
        return getSliderList(Object.assign(parameter, this.queryParam))
      }
    }
  },
  mounted () {
    listSliderPosition().then(res => {
      if (res.ok) {
        this.positionList = res.data
      }
    })
  },
  methods: {
    handleAdd () {
      this.title = '新增'
      this.visible = true
      this.$nextTick(() => {
        this.form.resetFields()
      })
    },
    handleEdit (item) {
      this.title = '编辑'
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue({
          'id': item.id,
          'pic': item.pic,
          'title': item.title,
          'sliderType': item.position
        })
        this.$refs.imgUpload.setImg([{
          uid: '-1',
          name: 'a',
          status: 'done',
          url: item.pic
        }])
      })
    },
    handleOk () {
      this.form.validateFields((err, values) => {
        if (!err) {
          saveSlider(values).then(res => {
            if (res.ok) {
              this.$message.info('保存成功')
              this.visible = false
              this.showLoadingMore()
            }
          })
        }
      })
    },
    showLoadingMore () {
      this.$refs.table.refresh(true)
    },
    handleDel (item) {
      delSlider(item.id).then(res => {
        if (res.ok) {
          this.$message.info('删除成功')
          this.showLoadingMore()
        }
      })
    },
    handleChange (info) {
      const file = info[0]
      if (file.status !== 'done') {
        return
      }
      const data = file.response
      if (data.ok) {
        this.form.setFieldsValue({
          'pic': data.data.fileName
        })
        this.imageUrl = data.data.fileName
      }
    },
    changeStatus (p, row) {
      saveSlider({
        id: row.id,
        status: p ? 0 : 1
      }).then(res => {
        if (res.ok) {
          this.$message.info('保存成功')
          this.visible = false
          this.showLoadingMore()
        }
      })
    },
    changePos (val) {
      this.positionList.map(it => {
        if (it.name === val.target.value) {
          this.tips = it.value
          this.sliderType = it.name
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.img-list{
  width: 200px;
  max-height: 150px;
}
</style>
