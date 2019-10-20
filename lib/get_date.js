module.exports = () => {
  let today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  let hour = today.getHours() % 12
  hour = hour || 12
  let min = today.getMinutes()
  min = min < 10 ? '0' + min : min
  const ampm = hour >= 12 ? 'AM' : 'PM'
  const time = `${hour}:${min} ${ampm}`

  return `${yyyy}/${mm}/${dd} ${time}`
}
