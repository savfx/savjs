import {Modal, get} from 'sav'

@Modal({
  path: '',
  view: true
})
export default class Home {

  @get({
    path: '',
    title: 'ProjectName'
  }) index() {}

}
