module.exports = () => {
  let today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()

  return `${yyyy}/${mm}/${dd} ${time}`
}
